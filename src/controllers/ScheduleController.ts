import { Request, Response } from 'express';
import { ScheduleService } from '../services/ScheduleService';
import { GetScheduleOptions } from '../services/ScheduleService';

export class ScheduleController {
  async getSchedule(req: Request, res: Response): Promise<Response> {
    try {
        const scheduleService = new ScheduleService(); // Создаем в методе
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
            return res.status(400).json({ error: 'Неверный формат masterId' });
        }
        options.masterId = id;
        }
        const schedule = await scheduleService.getSchedule(options);
        return res.status(200).json(schedule);
    } catch (error) {
        console.error('Ошибка при получении расписания:', error);
        return res.status(500).json({ error: 'Не удалось загрузить расписание' });
    }
    }
}