import prisma from '../config/database';
import { planOrders } from '../scheduler/scheduler';
import { toSchedulerOrder } from '../scheduler/dtos/order.dto';
import { createResourcesFromEmployees } from '../scheduler/resources';
import { ScheduleItem } from '../scheduler/scheduler';

export class PlannedScheduleService {
  async generate(): Promise<ScheduleItem[]> {
    // Только заказы со статусом pending и без мастера
    const orders = await prisma.order.findMany({
      where: {
        status: 'pending',
        employeeId: null,
      },
      include: {
        customer: true,
        service: true,
      },
    });

    console.log('🔹 Количество неназначенных заказов:', orders.length);
    console.log('📦 Переданы в планировщик:', orders.map(o => ({
      id: o.id,
      serviceName: o.service.name,
      preferredTime: o.preferredTime,
      duration: o.duration
    })));

    const employees = await prisma.employee.findMany();
    console.log('👷 Мастера:', employees.map(e => ({ id: e.id, name: e.name })));

    const schedulerOrders = orders.map(toSchedulerOrder);
    const resources = createResourcesFromEmployees(employees);

    const result = planOrders(schedulerOrders, resources);
    console.log('✅ Результат планировщика:', result.length, 'задач');

    return result;
  }
}