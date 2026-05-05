// src/controllers/ScheduleController.ts

import { Request, Response } from "express";
import { ScheduleService } from "../services/ScheduleService";
import { PlannedScheduleService } from "../services/PlannedScheduleService";
import { GetScheduleOptions } from "../services/ScheduleService";
import prisma from "../config/database";

export class ScheduleController {
  private scheduleService: ScheduleService;
  private plannedScheduleService: PlannedScheduleService;

  constructor() {
    this.scheduleService = new ScheduleService();
    this.plannedScheduleService = new PlannedScheduleService(); // создаём новый сервис
    this.getSchedule = this.getSchedule.bind(this);
    this.getRecommendations = this.getRecommendations.bind(this);
  }

  // === Старый метод: реальное расписание ===
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

  // === Новый метод: интеллектуальные рекомендации ===
  async getRecommendations(req: Request, res: Response): Promise<Response> {
    try {
      const schedule = await this.plannedScheduleService.generate();
      return res.status(200).json(schedule);
    } catch (error) {
      console.error("Ошибка при генерации рекомендаций:", error);
      return res
        .status(500)
        .json({ error: "Не удалось сгенерировать расписание" });
    }
  }

  async applyRecommendations(req: Request, res: Response) {
  const { recommendations } = req.body;

  console.log('📥 Получены рекомендации:', recommendations); // 🔥 Лог

  if (!Array.isArray(recommendations)) {
    return res.status(400).json({ error: 'Ожидался массив рекомендаций' });
  }

  try {
    for (const rec of recommendations) {
      console.log('🔍 Обрабатываем рекомендацию:', rec); // 🔥 Что пришло?

      const orderId = parseInt(rec.orderId, 10);
      const masterId = parseInt(rec.resourceId, 10);

      console.log('🔢 orderId:', rec.orderId, '→', orderId); // NaN?
      console.log('🔧 masterId:', rec.resourceId, '→', masterId);

      if (isNaN(orderId)) {
        console.warn(`❌ Неверный ID заказа: ${rec.orderId}`);
        continue;
      }

      if (isNaN(masterId)) {
        console.warn(`❌ Неверный ID мастера: ${rec.resourceId}`);
        continue;
      }

      const order = await prisma.order.findUnique({
         where: {
          id: orderId,
        },
      });

      if (!order) {
        console.warn(`⚠️ Заказ с ID=${orderId} не найден`);
        continue;
      }

      if (order.employeeId !== null) {
        console.warn(`⚠️ Заказ ${orderId} уже назначен`);
        continue;
      }

      await prisma.order.update({
        where: {
            id: orderId,
        },
        data: {
          employeeId: masterId,
          status: 'in_progress',
          preferredTime: new Date(Date.now() + rec.start * 60 * 1000),
        },
      });

      console.log(`✅ Заказ ${orderId} назначен мастеру ${masterId}`);
    }

    res.status(200).json({ message: 'Рекомендации применены' });
  } catch (error: any) {
    console.error('💥 Ошибка при применении:', error); // 🔥 Увидим здесь
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
}
}
