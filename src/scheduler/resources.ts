import { Employee } from '@prisma/client';

export interface Resource {
  id: string;
  kind: 'POST' | 'MECHANIC';
  postType?: 'LIFT' | 'DIAG' | 'UNIVERSAL';
  skill?: 'A' | 'B' | 'C';
  workStart: number; // минуты от начала дня
  workEnd: number;
}

export function createResourcesFromEmployees(employees: Employee[]): Resource[] {
  return employees.map(emp => ({
    id: emp.id.toString(),
    kind: 'MECHANIC',
    postType: 'UNIVERSAL', // можно улучшить через specialization
    workStart: 8 * 60,     // 8:00
    workEnd: 18 * 60,      // 18:00
  }));
}