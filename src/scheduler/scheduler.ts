// scheduler.ts

// ===== Базовые типы =====

export type Time = number; // минуты от начала дня

export type ServiceType = 'MAINTENANCE' | 'DIAGNOSTICS' | 'REPAIR';

export interface ServiceOrder {
  id: string;
  vehicleId: string;
  serviceType: ServiceType;
  durationMinutes: number;

  // Желательное окно клиента
  desiredStart: Time;
  desiredEnd: Time;

  requiredPostType: 'LIFT' | 'DIAG' | 'UNIVERSAL';
  requiredSkill: 'A' | 'B' | 'C';

  priority: 'URGENT' | 'NORMAL';
}

export interface Resource {
  id: string;
  kind: 'POST' | 'MECHANIC';

  // Для постов
  postType?: 'LIFT' | 'DIAG' | 'UNIVERSAL';

  // Для механиков
  skill?: 'A' | 'B' | 'C';

  workStart: Time;
  workEnd: Time;
}

export interface ScheduleItem {
  id: string;
  orderId: string;
  resourceId: string;
  start: Time;
  end: Time;

  // KPI (можно расширять)
  timeEfficiency?: number;
}

// Вариант размещения заказа на ресурсе
interface PlanVariant {
  orderId: string;
  resourceId: string;
  start: Time;
  end: Time;
  timeEfficiency: number; // [0..1], чем ближе к desiredStart, тем лучше
}

// ===== Вспомогательные функции =====

// Проверка пересечения интервалов для ресурса
function hasConflict(
  schedule: ScheduleItem[],
  resourceId: string,
  start: Time,
  end: Time,
): boolean {
  return schedule.some(item =>
    item.resourceId === resourceId &&
    // Есть пересечение интервалов?
    !(end <= item.start || start >= item.end)
  );
}

// Генерация возможных вариантов размещения одного заказа на одном ресурсе
function generateVariantsForResource(
  order: ServiceOrder,
  resource: Resource,
  schedule: ScheduleItem[],
  step: Time = 15, // шаг перебора, минут
): PlanVariant[] {
  const variants: PlanVariant[] = [];
  

  // Не выходим за рамки желаемого окна и рабочего времени ресурса
  const earliest = Math.max(order.desiredStart, resource.workStart);
  const latest = Math.min(
    order.desiredEnd - order.durationMinutes,
    resource.workEnd - order.durationMinutes,
  );

  if (earliest > latest) return variants;

  for (let start = earliest; start <= latest; start += step) {
    const end = start + order.durationMinutes;
    if (hasConflict(schedule, resource.id, start, end)) continue;

    const deviation = Math.abs(start - order.desiredStart);
    const timeEfficiency = 1 / (1 + deviation); // простая метрика

    variants.push({
      orderId: order.id,
      resourceId: resource.id,
      start,
      end,
      timeEfficiency,
    });
  }

  return variants;
}

// Выбор лучшего варианта по timeEfficiency
function chooseBestVariant(variants: PlanVariant[]): PlanVariant | null {
  if (variants.length === 0) return null;
  return variants.reduce((best, v) =>
    v.timeEfficiency > best.timeEfficiency ? v : best
  );
}

// Проверка, подходит ли ресурс под заказ (по типу поста/квалификации)
function isResourceSuitableForOrder(order: ServiceOrder, resource: Resource): boolean {
  if (resource.kind !== 'MECHANIC') return false;

  if (order.requiredPostType && resource.postType) {
    if (resource.postType !== 'UNIVERSAL' && resource.postType !== order.requiredPostType) {
      return false;
    }
  }

  // Если хочешь учитывать ещё и механиков — сюда можно добавить доп. логику
  return true;
}

// ===== Главная функция планировщика =====

// scheduler.ts (с логами)

export function planOrders(
  orders: ServiceOrder[],
  resources: Resource[],
  existingSchedule: ScheduleItem[] = [],
): ScheduleItem[] {
  const schedule: ScheduleItem[] = [...existingSchedule];

  console.log(`🔍 Начинаем планирование для ${orders.length} заказов`);
  console.log('📋 Существующие работы:', schedule.length);

  const sortedOrders = [...orders].sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority === 'URGENT' ? -1 : 1;
    }
    return a.desiredStart - b.desiredStart;
  });

  for (const order of sortedOrders) {
    console.log(`\n🎯 Планируем заказ: ${order.id}`);
    console.log(`   Желаемое время: ${order.desiredStart}-${order.desiredEnd} мин (${formatTime(order.desiredStart)} – ${formatTime(order.desiredEnd)})`);
    console.log(`   Длительность: ${order.durationMinutes} мин`);

    const suitableResources = resources.filter(r =>
      isResourceSuitableForOrder(order, r),
    );

    console.log(`   Подходящие ресурсы:`, suitableResources.map(r => r.id));

    let allVariants: PlanVariant[] = [];
    for (const res of suitableResources) {
      console.log(`   🛠️ Проверяем ресурс ${res.id}: рабочее время ${res.workStart}–${res.workEnd}`);
      const variants = generateVariantsForResource(order, res, schedule);
      console.log(`     Найдено вариантов: ${variants.length}`);
      allVariants = allVariants.concat(variants);
    }

    const best = chooseBestVariant(allVariants);
    if (!best) {
      console.warn(`❌ Не удалось запланировать заказ ${order.id}`);
      continue;
    }

    console.log(`✅ Лучший вариант: ${best.start}–${best.end} на ресурсе ${best.resourceId}`);

    schedule.push({
      id: `sch_${order.id}_${best.resourceId}`,
      orderId: order.id,
      resourceId: best.resourceId,
      start: best.start,
      end: best.end,
      timeEfficiency: best.timeEfficiency,
    });
  }

  return schedule;
}

// Вспомогательная функция для вывода времени
function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}