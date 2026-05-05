import { ServiceRepository } from '../repositories/ServiceRepository';
import { Service } from '@prisma/client';

export class ServiceService {
  private repository: ServiceRepository;

  constructor(repository: ServiceRepository = new ServiceRepository()) {
    this.repository = repository;
  }

  async getAllServices(): Promise<Service[]> {
    return this.repository.getAll();
  }

  async getServiceById(id: number): Promise<Service> {
    const service = await this.repository.getById(id);
    if (!service) {
      throw new Error('Услуга не найдена');
    }
    return service;
  }

  async createService( data: { name: string; duration: number }): Promise<Service> {
    // Проверка на дубликат по названию
    const existingByName = await this.repository.findByName(data.name);
    if (existingByName) {
      throw new Error('Услуга с таким названием уже существует');
    }

    // Проверка длительности
    if (data.duration < 15 || data.duration > 480) {
      throw new Error('Длительность должна быть от 15 до 480 минут');
    }

    return this.repository.create(data);
  }

  async updateService(id: number,  data: { name?: string; duration?: number }): Promise<Service> {
    const service = await this.repository.getById(id);
    if (!service) {
      throw new Error('Услуга не найдена');
    }

    // Проверка на дубликат названия, если оно изменяется
    if (data.name && data.name !== service.name) {
      const existingByName = await this.repository.findByName(data.name);
      if (existingByName) {
        throw new Error('Услуга с таким названием уже существует');
      }
    }

    // Проверка длительности
    if (data.duration !== undefined) {
      if (data.duration < 15 || data.duration > 480) {
        throw new Error('Длительность должна быть от 15 до 480 минут');
      }
    }

    return this.repository.update(id, data);
  }

  async deleteService(id: number): Promise<void> {
    const service = await this.repository.getById(id);
    if (!service) {
      throw new Error('Услуга не найдена');
    }
    
    // Проверка, есть ли у услуги заказы
    const ordersCount = await this.repository.getOrdersCount(id);
    if (ordersCount > 0) {
      throw new Error('Нельзя удалить услугу с активными заказами');
    }
    
    await this.repository.delete(id);
  }
}