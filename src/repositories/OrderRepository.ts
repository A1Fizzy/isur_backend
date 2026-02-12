import prisma from '../config/database';
import { Order } from '@prisma/client';

// Тип для данных создания заказа
interface CreateOrderData {
  customerId: number;
  serviceId: number;
  preferredTime: Date;
  duration: number;
  employeeId?: number | null;
  status?: string;
}

export class OrderRepository {
  async create(data: CreateOrderData): Promise<Order> {
    return await prisma.order.create({ data });
  }

  async findAll(): Promise<Order[]> {
    return await prisma.order.findMany({
      include: { 
        customer: true, 
        service: true, 
        employee: true 
      }
    });
  }

  async findById(id: number): Promise<Order | null> {
    return await prisma.order.findUnique({
      where: { id },
      include: { 
        customer: true, 
        service: true, 
        employee: true 
      }
    });
  }

  async update(id: number, data: Partial<Order>): Promise<Order> {
    return await prisma.order.update({
      where: { id },
      data,
    });
  }
}