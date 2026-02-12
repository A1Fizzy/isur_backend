import { Request, Response } from 'express';
import { VehicleService } from '../services/VehicleService';

export class VehicleController {
  private service: VehicleService;

  constructor() {
    this.service = new VehicleService();
  }

  async createVehicle(req: Request, res: Response): Promise<void> {
    const data = req.body;

    try {
      const vehicle = await this.service.createVehicle(data);
      res.status(201).json(vehicle);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllVehicles(req: Request, res: Response): Promise<void> {
    try {
      const vehicles = await this.service.getAllVehicles();
      res.status(200).json(vehicles);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getVehicleById(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Некорректный ID' });
      return;
    }

    try {
      const vehicle = await this.service.getVehicleById(id);
      if (!vehicle) {
        res.status(404).json({ error: 'Автомобиль не найден' });
        return;
      }
      res.status(200).json(vehicle);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  async updateVehicle(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    const data = req.body;

    if (isNaN(id)) {
        res.status(400).json({ error: 'Некорректный ID' });
        return;
    }

    try {
        const vehicle = await this.service.updateVehicle(id, data);
        res.status(200).json(vehicle);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
    }
  
}