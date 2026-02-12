import prisma from '../config/database';
import { Vehicle } from '@prisma/client';

export class VehicleRepository {
  async create(data: any): Promise<Vehicle> {
    return await prisma.vehicle.create({ data });
  }

  async findAll(): Promise<Vehicle[]> {
    return await prisma.vehicle.findMany();
  }

  async findById(id: number): Promise<Vehicle | null> {
    return await prisma.vehicle.findUnique({
      where: { id },
    });
  }
    async update(id: number, data: any): Promise<any> {
    return await prisma.vehicle.update({
        where: { id },
        data: {
        plateNumber: data.plateNumber,
        model:       data.model,
        year:        data.year
        }
    });
    }

  async delete(id: number): Promise<void> {
    await prisma.vehicle.delete({
      where: { id },
    });
  }
}