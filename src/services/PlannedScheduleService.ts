// src/services/PlannedScheduleService.ts
import { planOrders } from "../scheduler/planOrders";
import prisma from "../config/database";
import {
  ServiceOrder,
  Resource,
  PostType,
  SkillLevel,
  Specialization,
  ScheduleItem,
} from "../scheduler/types";
import { endOfDay, startOfDay } from "date-fns";

export class PlannedScheduleService {
  async generate(targetDate?: Date) {
    try {
      console.log("🚀 Запуск генерации рекомендаций");
      const [dbOrders, dbMasters] = await Promise.all([
        this.loadPendingOrders(),
        this.loadAvailableResources(),
      ]);

      let planningDate: Date;

      if (dbOrders.length > 0) {
        // Берём дату из preferredTime первого заказа
        const orderDate = new Date(dbOrders[0].preferredTime);
        planningDate = new Date(
          orderDate.getFullYear(),
          orderDate.getMonth(),
          orderDate.getDate(),
        );
      } else if (targetDate) {
        // Если заказов нет — используем targetDate
        planningDate = new Date(
          targetDate.getFullYear(),
          targetDate.getMonth(),
          targetDate.getDate(),
        );
      } else {
        // По умолчанию — сегодня
        planningDate = new Date();
        planningDate.setHours(0, 0, 0, 0);
      }

      console.log("📅 Дата для планирования:", planningDate.toISOString());

      if (!targetDate) {
        throw new Error("targetDate не может быть undefined");
      }

      // 2. Сначала попробуем найти ВСЕ активные заказы без фильтра по дате
      const allActiveOrders = await prisma.order.findMany({
        where: {
          status: { notIn: ["cancelled", "completed"] },
        },
        include: { service: true },
      });

      const orders = dbOrders.map((order) => ({
        id: order.id.toString(),
        vehicleId: order.vehicleId ? String(order.vehicleId) : "unknown",
        serviceType: this.mapServiceNameToType(order.service.name),
        durationMinutes: order.service.duration,
        desiredStart: new Date(order.preferredTime),
        desiredEnd: new Date(
          new Date(order.preferredTime).getTime() + 2 * 60 * 60 * 1000,
        ), // +2 часа
        requiredPostType: "UNIVERSAL" as PostType,
        requiredSpecialization: order.service.specialization as Specialization,
        requiredSkill: "A" as SkillLevel,
        priority: order.priority === "URGENT" ? "URGENT" : "NORMAL",
      }));

      const resources = dbMasters.map((master) => ({
        id: master.id.toString(),
        kind: "MECHANIC" as const,
        skill: "A" as const,
        postType: "UNIVERSAL" as const,
        specialization: master.specialization || "universal",
        workStart: this.createWorkTime(planningDate, 8, 0), // 08:00
        workEnd: this.createWorkTime(planningDate, 18, 0), // 18:00
      }));

      return planOrders(orders, resources);
    } catch (error) {
      console.error("Ошибка в PlannedScheduleService:", error);
      throw error;
    }
  }

  private async loadPendingOrders() {
    return await prisma.order.findMany({
      where: { status: {notIn: ["completed", "cancelled"] }},
      include: { service: true },
    });
  }

  private async loadAvailableResources() {
    const masters = await prisma.employee.findMany();
    return masters;
  }

  private mapServiceNameToType(
    name: string,
  ): "MAINTENANCE" | "DIAGNOSTICS" | "REPAIR" {
    if (name.includes("ТО")) return "MAINTENANCE";
    if (name.includes("диагноз")) return "DIAGNOSTICS";
    return "REPAIR";
  }

  private setDayForTime(timeStr: string, date: Date): Date {
    const [h, m] = timeStr.split(":").map(Number);
    const result = new Date(date);
    result.setHours(h, m, 0, 0);
    return result;
  }

  private createWorkTime(date: Date, hour: number, minute: number): Date {
    const workTime = new Date(date);
    workTime.setHours(hour, minute, 0, 0);
    return workTime;
  }
}
