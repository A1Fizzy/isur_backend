import { Request, Response } from 'express';
import { CustomerService } from '../services/CustomerService';

export class CustomerController {
  private service: CustomerService;

  constructor(service: CustomerService = new CustomerService()) {
    this.service = service;
  }

  async getAllCustomers(req: Request, res: Response): Promise<void> {
    try {
      const customers = await this.service.getAllCustomers();
      res.status(200).json(customers);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Не удалось загрузить клиентов' });
    }
  }

  async getCustomerById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Некорректный ID клиента' });
        return;
      }

      const customer = await this.service.getCustomerById(id);
      res.status(200).json(customer);
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ error: error.message });
    }
  }

  async createCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { name, phone, email } = req.body;

      if (!name || !phone) {
        res.status(400).json({ error: 'Имя и телефон обязательны' });
        return;
      }

      const customer = await this.service.createCustomer({ name, phone, email });
      res.status(201).json(customer);
    } catch (error: any) {
      const status = error.statusCode || 400;
      res.status(status).json({ error: error.message });
    }
  }

  async updateCustomer(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Некорректный ID клиента' });
        return;
      }

      const { name, phone, email } = req.body;
      const updateData: any = {};

      if (name !== undefined) updateData.name = name;
      if (phone !== undefined) updateData.phone = phone;
      if (email !== undefined) updateData.email = email;

      const customer = await this.service.updateCustomer(id, updateData);
      res.status(200).json(customer);
    } catch (error: any) {
      const status = error.statusCode || 400;
      res.status(status).json({ error: error.message });
    }
  }

  async deleteCustomer(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Некорректный ID клиента' });
        return;
      }

      await this.service.deleteCustomer(id);
      res.status(204).send();
    } catch (error: any) {
      const status = error.statusCode || 400;
      res.status(status).json({ error: error.message });
    }
  }
}