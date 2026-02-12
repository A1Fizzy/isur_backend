import { Request, Response } from 'express';
import { EmployeeService } from '../services/EmployeeService';

export class EmployeeController {
  private service: EmployeeService;

  constructor() {
    this.service = new EmployeeService();
  }

  async createEmployee(req: Request, res: Response): Promise<void> {
    try {
      const employee = await this.service.createEmployee(req.body);
      res.status(201).json(employee);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllEmployees(req: Request, res: Response): Promise<void> {
    try {
      const employees = await this.service.getAllEmployees();
      res.status(200).json(employees);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getEmployeeById(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        res.status(400).json({ error: 'Некорректный ID' })
        return;
    };

    try {
      const employee = await this.service.getEmployeeById(id);
      if (!employee) {
        res.status(404).json({ error: 'Мастер не найден' });
        return;
      }
      res.status(200).json(employee);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getEmployeeByUserId(req: Request, res: Response): Promise<void> {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
        res.status(400).json({ error: 'Некорректный user ID' })
        return;
    };

    try {
      const employee = await this.service.getEmployeeByUserId(userId);
      if (!employee) {
        res.status(404).json({ error: 'Мастер не найден' });
        return;
      }
      res.status(200).json(employee);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateEmployee(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        res.status(400).json({ error: 'Некорректный ID' });
        return;
    }

    try {
      const employee = await this.service.updateEmployee(id, req.body);
      res.status(200).json(employee);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateByUserId(req: Request, res: Response): Promise<void> {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      res.status(400).json({ error: 'Некорректный ID' });
      return;
    }
    try {
      const employee = await this.service.updateEmployeeByUserId(userId, req.body);
      res.status(200).json(employee);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}