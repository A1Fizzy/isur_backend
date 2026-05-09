import prisma from "../config/database";
import { Employee } from "@prisma/client";

export class EmployeeRepository {
  async create(data: any): Promise<Employee> {
    // Проверяем, не назначен ли уже этот userId другому мастеру
    if (data.userId) {
      const existing = await prisma.employee.findUnique({
        where: { userId: data.userId },
      });

      if (existing) {
        throw new Error(
          `Пользователь с userId=${data.userId} уже является мастером`,
        );
      }
    }

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
        specialization: data.specialization,
      },
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.employee.delete({
      where: { id },
    });
  }
}
