import { Service } from '@prisma/client';
import prisma from '../config/database';

export class ServiceRepository {

  async getAll(): Promise<Service[]> {
    return await prisma.service.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async getById(id: number): Promise<Service | null> {
    return await prisma.service.findUnique({
      where: { id }
    });
  }

  async create(data: {name: string; duration: number }): Promise<Service> {
    return await prisma.service.create({
       data: {
        name: data.name,
        duration: data.duration
      }
    });
  }

  async update(id: number,  data: { name?: string; duration?: number }): Promise<Service> {
    return await prisma.service.update({
      where: { id },
       data: {
        name: data.name,
        duration: data.duration
      }
    });
  }

  async delete(id: number): Promise<Service> {
    return await prisma.service.delete({
      where: { id }
    });
  }

  async findByName(name: string): Promise<Service | null> {
    return await prisma.service.findFirst({
      where: { name }
    });
  }

  async getOrdersCount(serviceId: number): Promise<number> {
    return await prisma.order.count({
      where: { serviceId }
    });
  }
}