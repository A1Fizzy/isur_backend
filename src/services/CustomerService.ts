import { CustomerRepository } from '../repositories/CustomerRepository';
import { Customer } from '@prisma/client';

export class CustomerService {
  private repository: CustomerRepository;

  constructor(repository: CustomerRepository = new CustomerRepository()) {
    this.repository = repository;
  }

  async getAllCustomers(): Promise<Customer[]> {
    return this.repository.getAll();
  }

  async getCustomerById(id: number): Promise<Customer> {
    const customer = await this.repository.getById(id);
    if (!customer) {
      throw new Error('Клиент не найден');
    }
    return customer;
  }

  async createCustomer(data: { name: string; phone: string; email?: string }): Promise<Customer> {
    // Проверка на дубликат по телефону
    const existingByPhone = await this.repository.findByPhone(data.phone);
    if (existingByPhone) {
      throw new Error('Клиент с таким телефоном уже существует');
    }

    // Проверка email на уникальность, если указан
    if (data.email) {
      const existingByEmail = await this.repository.findByEmail(data.email);
      if (existingByEmail) {
        throw new Error('Клиент с таким email уже существует');
      }
    }

    return this.repository.create(data);
  }

  async updateCustomer(id: number, data: { name?: string; phone?: string; email?: string | null }): Promise<Customer> {
    const customer = await this.repository.getById(id);
    if (!customer) {
      throw new Error('Клиент не найден');
    }

    // Проверка на дубликат телефона, если он изменяется
    if (data.phone && data.phone !== customer.phone) {
      const existingByPhone = await this.repository.findByPhone(data.phone);
      if (existingByPhone) {
        throw new Error('Клиент с таким телефоном уже существует');
      }
    }

    // Проверка email на уникальность, если он изменяется
    if (data.email && data.email !== customer.email) {
      const existingByEmail = await this.repository.findByEmail(data.email);
      if (existingByEmail) {
        throw new Error('Клиент с таким email уже существует');
      }
    }

    return this.repository.update(id, data);
  }

  async deleteCustomer(id: number): Promise<void> {
    const customer = await this.repository.getById(id);
    if (!customer) {
      throw new Error('Клиент не найден');
    }
    
    // Проверка, есть ли у клиента заказы
    const ordersCount = await this.repository.getOrdersCount(id);
    if (ordersCount > 0) {
      throw new Error('Нельзя удалить клиента с активными заказами');
    }
    
    await this.repository.delete(id);
  }
}