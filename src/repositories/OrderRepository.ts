import prisma from '../config/database';
import { Order } from '@prisma/client';

// Тип для данных создания заказа
interface CreateOrderData {
  customerId: number;
  serviceId: number;
  vehicleId: number;
  preferredTime: Date;
  duration: number;
  employeeId?: number | null;
  status?: string;
  priority?: "NORMAL" | "URGENT";
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
        employee: true,
        vehicle: true,
      }
    });
  }

  async findById(id: number): Promise<Order | null> {
    return await prisma.order.findUnique({
      where: { id },
      include: { 
        customer: true, 
        service: true, 
        employee: true,
        vehicle: true 
      }
    });
  }

  async update(id: number, data: Partial<Order>): Promise<Order> {
    return await prisma.order.update({
      where: { id },
      data,
    });
  }

  async getById(id: number): Promise<Order | null> {
    return await prisma.order.findUnique({
      where: { id }
    });
  }

  async updateStatus(id: number, status: string): Promise<Order> {
    return await prisma.order.update({
      where: { id },
      data: { status },
    });
  }

  async countActiveByVehicle(vehicleId: number, excludeStatuses: string[] = []): Promise<number> {
    return await prisma.order.count({
      where: {
        vehicleId,
        status: { notIn: excludeStatuses },
      },
    });
  }

  async updateVehicleStatus(vehicleId: number, status: string): Promise<void> {
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { status },
    });
  }

  async delete(id: number): Promise<Order> {
    return await prisma.order.delete({
      where: { id }
    });
  }
}