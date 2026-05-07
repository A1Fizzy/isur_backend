// src/scheduler/utils.ts

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
  return schedule.some(item =>
    item.resourceId === resourceId &&
    !(end <= item.start || start >= item.end)
  );
}

/**
 * Простая метрика эффективности: чем ближе к желаемому началу — тем лучше
 */
export function calculateTimeEfficiency(desiredStart: Date, actualStart: Date): number {
  const diff = Math.abs(differenceInMinutes(actualStart, desiredStart));
  return 1 / (1 + diff / 30); // нормализация: 30 мин = коэффициент ~0.5
}