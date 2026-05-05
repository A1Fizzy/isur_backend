import { Order } from '@prisma/client';
import { ServiceType } from '../scheduler';

export interface ServiceOrder {
  id: string;
  vehicleId: string;
  serviceType: ServiceType;
  durationMinutes: number;
  desiredStart: number; // минуты от начала дня
  desiredEnd: number;
  requiredPostType: 'LIFT' | 'DIAG' | 'UNIVERSAL';
  requiredSkill: 'A' | 'B' | 'C'; // пока заглушка
  priority: 'URGENT' | 'NORMAL';
}

export function toSchedulerOrder(order: Order): ServiceOrder {
  const preferredTime = new Date(order.preferredTime);
  const hours = preferredTime.getHours();
  const minutes = preferredTime.getMinutes();
  const totalMinutesFromStartOfDay = hours * 60 + minutes;

  return {
    id: order.id.toString(),
    vehicleId: order.customerId.toString(),
    serviceType: mapServiceToType(order.serviceId),
    durationMinutes: order.duration,
    desiredStart: totalMinutesFromStartOfDay,
    desiredEnd: totalMinutesFromStartOfDay + 4 * 60, // окно ±2 часа
    requiredPostType: 'UNIVERSAL',
    requiredSkill: 'B',
    priority: order.status === 'urgent' ? 'URGENT' : 'NORMAL',
  };
}

function mapServiceToType(serviceId: number): ServiceType {
  // Здесь может быть маппинг по ID или имени услуги
  // Пример:
  if ([1, 2].includes(serviceId)) return 'MAINTENANCE';
  if ([3, 4].includes(serviceId)) return 'DIAGNOSTICS';
  return 'REPAIR';
}