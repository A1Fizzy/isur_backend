import { differenceInMinutes } from 'date-fns';
import { ScheduleItem } from './types';

/**
 * Проверяет, пересекается ли интервал с существующими назначениями
 */
export function hasConflict(
  schedule: ScheduleItem[],
  resourceId: string,
  start: Date,
  end: Date
): boolean {
  return schedule.some(item => {
    // Проверяем только того же мастера
    if (item.resourceId !== resourceId) return false;

    // Проверяем пересечение по времени
    const itemStart = new Date(item.start).getTime();
    const itemEnd = new Date(item.end).getTime();
    const newStart = start.getTime();
    const newEnd = end.getTime();

    // Пересечение: новый интервал пересекается с существующим
    return newStart < itemEnd && newEnd > itemStart;
  });
}

/**
 * Простая метрика эффективности: чем ближе к желаемому началу — тем лучше
 */
export function calculateTimeEfficiency(desiredStart: Date, actualStart: Date): number {
  const diff = Math.abs(differenceInMinutes(actualStart, desiredStart));
  return 1 / (1 + diff / 30); // нормализация: 30 мин = коэффициент ~0.5
}