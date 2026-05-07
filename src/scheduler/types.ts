// src/scheduler/types.ts

export type ServiceType = 'MAINTENANCE' | 'DIAGNOSTICS' | 'REPAIR';
export type SkillLevel = 'A' | 'B' | 'C';
export type PostType = 'LIFT' | 'DIAG' | 'UNIVERSAL';

export interface ServiceOrder {
  id: string;
  vehicleId: string;
  serviceType: ServiceType;
  durationMinutes: number;

  // Клиент хочет начать работу в это окно
  desiredStart: Date;
  desiredEnd: Date;

  requiredPostType: PostType;
  requiredSkill: SkillLevel;

  priority: string;
}

export interface Resource {
  id: string;
  kind: 'POST' | 'MECHANIC';

  // Для постов
  postType?: PostType;

  // Для механиков
  skill?: SkillLevel;

  workStart: Date; // Начало рабочего дня
  workEnd: Date;   // Конец рабочего дня
}

export interface ScheduleItem {
  id: string;
  orderId: string;
  resourceId: string;
  start: Date;
  end: Date;
  timeEfficiency?: number;
}