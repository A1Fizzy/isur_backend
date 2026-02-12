import { Request, Response } from 'express';
import { OrderService } from '../services/OrderService';
import { CreateOrderRequest } from '../models/types';

export class OrderController {
  private service: OrderService;

  constructor() {
    this.service = new OrderService();
  }

  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const body: CreateOrderRequest = req.body;

      const order = await this.service.createOrder({
        customerId: Number(body.customerId),
        serviceId: Number(body.serviceId),
        preferredTime: new Date(body.preferredTime),
        duration: Number(body.duration)
      });

      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getOrders(req: Request, res: Response): Promise<void> {
    try {
      const orders = await this.service.getAllOrders();
      res.status(200).json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const order = await this.service.getOrderById(id);

      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      res.status(200).json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const orderId = parseInt(id, 10);

      if (isNaN(orderId)) {
        res.status(400).json({ error: 'Invalid order ID' });
        return;
      }

      const { 
        customerId, 
        serviceId, 
        preferredTime, 
        duration, 
        employeeId, 
        masterId,
        status 
      } = req.body;

      const updateData: any = {};

      if (customerId !== undefined) {
        const id = Number(customerId);
        if (isNaN(id) || id <= 0) {
          res.status(400).json({ error: 'Invalid customerId' });
          return;
        }
        updateData.customerId = id;
      }

      if (serviceId !== undefined) {
        const id = Number(serviceId);
        if (isNaN(id) || id <= 0) {
          res.status(400).json({ error: 'Invalid serviceId' });
          return;
        }
        updateData.serviceId = id;
      }

      if (preferredTime !== undefined) {
        const date = new Date(preferredTime);
        if (isNaN(date.getTime())) {
          res.status(400).json({ error: 'Invalid preferredTime' });
          return;
        }
        updateData.preferredTime = date;
      }

      if (duration !== undefined) {
        const dur = Number(duration);
        if (isNaN(dur) || dur <= 0) {
          res.status(400).json({ error: 'Duration must be a positive number' });
          return;
        }
        updateData.duration = dur;
      }

      const assignedMasterId = masterId !== undefined ? masterId : employeeId;
      
      if (assignedMasterId !== undefined) {
        if (assignedMasterId !== null && assignedMasterId !== '') {
          const id = Number(assignedMasterId);
          if (isNaN(id) || id <= 0) {
            res.status(400).json({ error: 'Invalid masterId/employeeId' });
            return;
          }
          updateData.employeeId = id;
        } else {
          updateData.employeeId = null;
        }
      }

      if (status !== undefined) {
        if (!['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
          res.status(400).json({ error: 'Invalid status' });
          return;
        }
        updateData.status = status;
      }

      console.log('🔄 Обновление заказа:', { orderId, updateData });

      const updatedOrder = await this.service.updateOrder(orderId, updateData);

      res.status(200).json(updatedOrder);
    } catch (error: any) {
      console.error('❌ Ошибка при обновлении заказа:', error);
      res.status(500).json({
        error: error.message || 'Не удалось обновить заказ',
      });
    }
  }
}