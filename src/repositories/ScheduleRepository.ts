import prisma from '../config/database';
import { Prisma } from '@prisma/client';

// DTO для расписания
export interface ScheduleEntry {
  id: number;
  title: string;
  customerName: string;
  serviceName: string;
  startTime: string;
  endTime: string;
  masterId: number | null;
  employeeName: string;
}

export interface GetScheduleOptions {
  from?: Date;
  to?: Date;
  masterId?: number;
}

export class ScheduleRepository {
  async getSchedule(options: GetScheduleOptions = {}): Promise<ScheduleEntry[]> {
    const where: Prisma.OrderWhereInput = {
      status: { not: 'cancelled' },
      employeeId: {
        not: null,
        equals: options.masterId || undefined,
      },
      preferredTime: {
        gte: options.from,
        lte: options.to,
      },
    };

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: true,
        service: true,
        employee: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        preferredTime: 'asc',
      },
    });

    return orders.map((order) => {
      const start = new Date(order.preferredTime);
      const end = new Date(start.getTime() + order.duration * 60 * 1000);

      return {
        id: order.id,
        title: `${order.service.name} (${order.customer.name})`,
        customerName: order.customer.name,
        serviceName: order.service.name,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        masterId: order.employeeId,
        employeeName: order.employee?.user?.name || 'Неизвестно',
      };
    });
  }
}