// src/controllers/ScheduleController.ts
import { Request, Response } from "express";
import { GetScheduleOptions, ScheduleService } from "../services/ScheduleService";
import { PlannedScheduleService } from "../services/PlannedScheduleService";
import prisma from "../config/database";

export class ScheduleController {
  private scheduleService: ScheduleService;
  private plannedScheduleService: PlannedScheduleService;

  constructor() {
    this.scheduleService = new ScheduleService();
    this.plannedScheduleService = new PlannedScheduleService();
  }

  async getSchedule(req: Request, res: Response): Promise<Response> {
    try {
      const { from, to, masterId } = req.query;

      const options: GetScheduleOptions = {};

      if (from) {
        const date = new Date(from as string);
        if (isNaN(date.getTime())) {
          return res.status(400).json({ error: 'Неверный формат даты "from"' });
        }
        options.from = date;
      }

      if (to) {
        const date = new Date(to as string);
        if (isNaN(date.getTime())) {
          return res.status(400).json({ error: 'Неверный формат даты "to"' });
        }
        options.to = date;
      }

      if (masterId) {
        const id = parseInt(masterId as string, 10);
        if (isNaN(id)) {
          return res.status(400).json({ error: "Неверный формат masterId" });
        }
        options.masterId = id;
      }

      const schedule = await this.scheduleService.getSchedule(options);
      return res.status(200).json(schedule);
    } catch (error) {
      console.error("Ошибка при получении расписания:", error);
      return res.status(500).json({ error: "Не удалось загрузить расписание" });
    }
  }
  
  async getRecommendations(req: Request, res: Response): Promise<Response> {
    try {
      const { date } = req.query;

      let targetDate: Date;
      if (date && typeof date === 'string') {
        targetDate = new Date(date);
        if (isNaN(targetDate.getTime())) {
          return res.status(400).json({ error: 'Неверный формат даты' });
        }
      } else {
        targetDate = new Date();
      }

      const recommendations = await this.plannedScheduleService.generate(targetDate);
      
      // Преобразуем в JSON-safe формат
      const response = recommendations.map(rec => ({
        ...rec,
        start: rec.start.toISOString(),
        end: rec.end.toISOString(),
        orderId: rec.orderId,
        resourceId: rec.resourceId
      }));

      return res.status(200).json(response);
    } catch (error) {
      console.error("Ошибка при генерации рекомендаций:", error);
      return res.status(500).json({ 
        error: "Не удалось сгенерировать расписание" 
      });
    }
  }

  async applyRecommendations(req: Request, res: Response) {
    const { recommendations } = req.body;

    if (!Array.isArray(recommendations)) {
      return res.status(400).json({ error: 'Ожидался массив рекомендаций' });
    }

    try {
      for (const rec of recommendations) {
        const orderId = parseInt(rec.orderId, 10);
        const masterId = parseInt(rec.resourceId, 10);

        if (isNaN(orderId) || isNaN(masterId)) continue;

        const order = await prisma.order.findUnique({ where: { id: orderId }, include: {vehicle: true} });
        if (!order || order.employeeId !== null) continue;

        await prisma.order.update({
          where: { id: orderId },
           data: {
            employeeId: masterId,
            status: 'in_progress',
            preferredTime: new Date(rec.start) // принимаем как есть
          }
        });

        if (order.vehicleId) {
        await prisma.vehicle.update({
          where: { id: order.vehicleId },
           data: {
            status: 'in_repair'
          }
        });
      }
      }

      return res.status(200).json({ message: 'Рекомендации применены' });
    } catch (error) {
      console.error('Ошибка при применении:', error);
      return res.status(500).json({ error: 'Внутренняя ошибка' });
    }
  }
}