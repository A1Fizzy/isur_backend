import { Order } from '@prisma/client';
import { OrderRepository } from '../repositories/OrderRepository';
import prisma from '../config/database';

// Тип для данных создания заказа
interface CreateOrderData {
  customerId: number;
  serviceId: number;
  preferredTime: Date;
  vehicleId: number;
  duration: number;
  priority: "NORMAL" | "URGENT";
}

type UpdateOrderData = Partial<Omit<Order, 'id' | 'createdAt'>>;

export class OrderService {
  private repository: OrderRepository;

  constructor() {
    this.repository = new OrderRepository();
  }

  async createOrder(data: CreateOrderData): Promise<Order> {
    if (!data.customerId || !data.serviceId || !data.vehicleId) {
      throw new Error('Missing required fields: customerId or serviceId or vehicleId');
    }

    return await this.repository.create({
      ...data,
      status: 'pending',
      employeeId: null
    });
  }

  async getAllOrders(): Promise<Order[]> {
    return await this.repository.findAll();
  }

  async getOrderById(id: number): Promise<Order | null> {
    return await this.repository.findById(id);
  }

  async updateOrder(id: number, data: any): Promise<any> {
    try {
      const existingOrder = await this.repository.findById(id);
      if (!existingOrder) {
        throw new Error('Order not found');
      }

      if (data.duration && data.duration <= 0) {
        throw new Error('Duration must be positive');
      }

      if (data.preferredTime && isNaN(new Date(data.preferredTime).getTime())) {
        throw new Error('Invalid preferred time');
      }

      const updatedOrder = await this.repository.update(id, data);
      return updatedOrder;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  async completeOrder(orderId: number): Promise<{ success: boolean; message: string }> {
    // Проверяем существование заказа
    const order = await this.repository.findById(orderId);
    if (!order) {
      throw new Error('Заказ не найден');
    }

    // Нельзя завершить уже завершённый заказ
    if (order.status === 'completed') {
      throw new Error('Заказ уже завершён');
    }

    // Выполняем всё в транзакции
    await prisma.$transaction(async (tx) => {
      // 1. Обновляем статус заказа
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'completed' },
      });

      // 2. Если есть автомобиль — проверяем активные заказы
      if (order.vehicleId) {
        // Считаем заказы "в работе", исключая текущий (он уже completed)
        const activeCount = await tx.order.count({
          where: {
            vehicleId: order.vehicleId,
            status: 'in_progress',
          },
        });

        // Если активных заказов нет — возвращаем авто в эксплуатацию
        if (activeCount === 0) {
          await tx.vehicle.update({
            where: { id: order.vehicleId },
            data: { status: 'in_service' },
          });
        }
      }
    });

    return { success: true, message: 'Заказ успешно завершён' };
  }

  async deleteOrder(id: number): Promise<void> {
    const order = await this.repository.getById(id);
    if (!order) {
      throw new Error('Заказ не найден');
    }
    await this.repository.delete(id);
  }
}