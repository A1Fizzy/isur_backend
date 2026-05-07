import { Order } from '@prisma/client';
import { OrderRepository } from '../repositories/OrderRepository';

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

  async deleteOrder(id: number): Promise<void> {
    const order = await this.repository.getById(id);
    if (!order) {
      throw new Error('Заказ не найден');
    }
    await this.repository.delete(id);
  }
}