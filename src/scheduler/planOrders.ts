// src/scheduler/planOrders.ts
import { ServiceOrder, Resource, ScheduleItem } from './types';
import { hasConflict, calculateTimeEfficiency } from './utils';

interface PlanVariant {
  orderId: string;
  resourceId: string;
  start: Date;
  end: Date;
  timeEfficiency: number;
}

function isResourceSuitable(order: ServiceOrder, resource: Resource): boolean {
  if (resource.kind !== 'MECHANIC') return false;

  // Проверка типа поста
  if (order.requiredPostType && resource.postType) {
    if (resource.postType !== 'UNIVERSAL' && resource.postType !== order.requiredPostType) {
      return false;
    }
  }

  // Проверка квалификации
  if (order.requiredSkill && resource.skill) {
    if (resource.skill < order.requiredSkill) {
      return false;
    }
  }

  if (order.requiredSpecialization) {
    // Переводим строку в один формат
    const reqSpec = order.requiredSpecialization.toLowerCase();
    const masterSpec = resource.specialization?.toLowerCase();

    if (!masterSpec) return false;

    // Мастер должен иметь нужную специализацию
    // Можно расширить: универсальный мастер → может всё
    if (reqSpec !== 'universal' && masterSpec !== 'universal' && masterSpec !== reqSpec) {
      return false;
    }
  }

  return true;
}

export function planOrders(
  orders: ServiceOrder[],
  resources: Resource[],
  existingSchedule: ScheduleItem[] = []
): ScheduleItem[] {
  const schedule: ScheduleItem[] = [...existingSchedule];

  console.log('Начинаем планирование для', orders.length, 'заказов');
  console.log('Ресурсы:', resources.map(r => `${r.id} (${r.workStart}–${r.workEnd})`));

  // Сортируем по приоритету и времени
  const sortedOrders = [...orders].sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority === 'URGENT' ? -1 : 1;
    }
    return a.desiredStart.getTime() - b.desiredStart.getTime();
  });

  for (const order of sortedOrders) {
    console.log(`\nПланируем заказ ${order.id}:`, {
      duration: order.durationMinutes,
      desiredStart: order.desiredStart.toISOString(),
      priority: order.priority
    });
    let bestVariant: PlanVariant | null = null;

    for (const resource of resources) {
      console.log(`   Проверяем мастера ${resource.id}`);
      if (!isResourceSuitable(order, resource)) {
        console.log(`     Не подходит по квалификации`);
        continue;
      }
      // Генерируем варианты каждые 15 минут
      const stepMs = 15 * 60 * 1000;
      const earliest = new Date(Math.max(order.desiredStart.getTime(), resource.workStart.getTime()));
      const latest = new Date(resource.workEnd.getTime() - order.durationMinutes * 60_000);

      console.log(`     Интервал: ${earliest.toISOString()} → ${latest.toISOString()}`);

      if (earliest > latest) {
        console.log('     Нет времени в рабочем дне');
        continue;
      }
      for (let time = earliest.getTime(); time <= latest.getTime(); time += stepMs) {
        const start = new Date(time);
        const end = new Date(time + order.durationMinutes * 60_000);

        if (hasConflict(schedule, resource.id, start, end)) {
          console.log(`     Конфликт: ${start.toISOString()} – ${end.toISOString()}`);
          continue;
        }
        const timeEfficiency = calculateTimeEfficiency(order.desiredStart, start);

        console.log(`     Вариант: ${start.toISOString()} – ${end.toISOString()}, эффективность: ${timeEfficiency}`);

        if (!bestVariant || timeEfficiency > bestVariant.timeEfficiency) {
          bestVariant = { orderId: order.id, resourceId: resource.id, start, end, timeEfficiency };
        }
      }
      console.log(`Проверка ресурса ${resource.id}: доступен с ${resource.workStart} до ${resource.workEnd}`);
    }

    if (bestVariant) {
      console.log(`Лучший вариант: мастер ${bestVariant.resourceId}, ${bestVariant.start.toISOString()} – ${bestVariant.end.toISOString()}`);
      
      schedule.push({
        id: `sch_${order.id}_${bestVariant.resourceId}`,
        orderId: bestVariant.orderId,
        resourceId: bestVariant.resourceId,
        start: bestVariant.start,
        end: bestVariant.end,
        timeEfficiency: bestVariant.timeEfficiency
      });
    } else {
      console.warn(`Не удалось запланировать заказ ${order.id}`);
    }
  }

  console.log('Генерация завершена. Итого рекомендаций:', schedule.length);
  return schedule;
}