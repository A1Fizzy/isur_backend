import prisma from '../config/database';
import { Customer } from '@prisma/client';

export class CustomerRepository {

  async getAll(): Promise<Customer[]> {
    return await prisma.customer.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async getById(id: number): Promise<Customer | null> {
    return await prisma.customer.findUnique({
      where: { id }
    });
  }

  async create(data: { name: string; phone: string; email?: string }): Promise<Customer> {
    return await prisma.customer.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null
      }
    });
  }

  async update(id: number, data: { name?: string; phone?: string; email?: string | null }): Promise<Customer> {
    return await prisma.customer.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email ?? undefined
      }
    });
  }

  async delete(id: number): Promise<Customer> {
    return await prisma.customer.delete({
      where: { id }
    });
  }

  async findByPhone(phone: string): Promise<Customer | null> {
    return await prisma.customer.findFirst({
      where: { phone },
    });
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return await prisma.customer.findUnique({
      where: { email },
    });
  }
  async getOrdersCount(customerId: number): Promise<number> {
    return await prisma.order.count({
      where: { 
        customerId 
      }
    });
  }
}