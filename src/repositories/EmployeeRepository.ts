import prisma from '../config/database';
import { Employee } from '@prisma/client';

export class EmployeeRepository {
  async create(data: any): Promise<Employee> {
    return await prisma.employee.create({ data });
  }

  async findAll(): Promise<Employee[]> {
    return await prisma.employee.findMany();
  }

  async findById(id: number): Promise<Employee | null> {
    return await prisma.employee.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: number): Promise<Employee | null> {
    return await prisma.employee.findUnique({
      where: { userId },
    });
  }

  async findFirst(where: any): Promise<any | null> {
    return await prisma.employee.findFirst({ where });
  }

  async update(id: number, data: any): Promise<any> {
    return await prisma.employee.update({
        where: { id },
          data: {
          name: data.name,
          specialization: data.specialization
        }
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.vehicle.delete({
      where: { id },
    });
  }
}