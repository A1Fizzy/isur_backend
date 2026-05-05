import { Request, Response } from 'express';
import { ServiceService } from '../services/ServiceService';

export class ServiceController {
  private service: ServiceService;

  constructor(service: ServiceService = new ServiceService()) {
    this.service = service;
  }

  async getAllServices(req: Request, res: Response): Promise<void> {
    try {
      const services = await this.service.getAllServices();
      res.status(200).json(services);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Не удалось загрузить услуги' });
    }
  }

  async getServiceById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Некорректный ID услуги' });
        return;
      }

      const service = await this.service.getServiceById(id);
      res.status(200).json(service);
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ error: error.message });
    }
  }

  async createService(req: Request, res: Response): Promise<void> {
    try {
      const { name, duration } = req.body;

      if (!name || duration === undefined) {
        res.status(400).json({ error: 'Название и длительность обязательны' });
        return;
      }

      const service = await this.service.createService({ name, duration });
      res.status(201).json(service);
    } catch (error: any) {
      const status = error.statusCode || 400;
      res.status(status).json({ error: error.message });
    }
  }

  async updateService(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Некорректный ID услуги' });
        return;
      }

      const { name, duration } = req.body;
      const updateData: any = {};

      if (name !== undefined) updateData.name = name;
      if (duration !== undefined) updateData.duration = duration;

      const service = await this.service.updateService(id, updateData);
      res.status(200).json(service);
    } catch (error: any) {
      const status = error.statusCode || 400;
      res.status(status).json({ error: error.message });
    }
  }

  async deleteService(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Некорректный ID услуги' });
        return;
      }

      await this.service.deleteService(id);
      res.status(204).send();
    } catch (error: any) {
      const status = error.statusCode || 400;
      res.status(status).json({ error: error.message });
    }
  }
}