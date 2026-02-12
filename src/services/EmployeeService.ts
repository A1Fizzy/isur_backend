import { EmployeeRepository } from '../repositories/EmployeeRepository';

interface CreateEmployeeData {
  name: string;
  specialization: string;
}

interface UpdateEmployeeData {
  name?: string;
  specialization?: string;
}

export class EmployeeService {
  private repository: EmployeeRepository;

  constructor() {
    this.repository = new EmployeeRepository();
  }

  async createEmployee(data: CreateEmployeeData): Promise<any> {
    if (!data.name || !data.specialization) {
      throw new Error('Имя и специализация обязательны');
    }
    return await this.repository.create(data);
  }

  async getAllEmployees(): Promise<any[]> {
    return await this.repository.findAll();
  }

  async getEmployeeById(id: number): Promise<any | null> {
    return await this.repository.findById(id);
  }

  async getEmployeeByUserId(userId: number): Promise<any | null> {
    return await this.repository.findFirst({ userId });
  }

  async getEmployeeByUserId(userId: number): Promise<Employee | null> {
    return await this.repository.findByUserId(userId);
  }

  async updateEmployee(id: number, employeeData: Partial<Employee>): Promise<Employee> {
    const employee = await this.repository.update(id, employeeData);
    if (!employee) {
      throw new Error('Мастер не найден');
    }
    return employee;
  }

  async updateEmployee(id: number, data: UpdateEmployeeData): Promise<any> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new Error('Мастер не найден');

    if (data.name === '') throw new Error('Имя не может быть пустым');
    if (data.specialization === '') throw new Error('Специализация обязательна');
    // Объединяем старые данные с новыми
    const updatedData = {
      ...existing,
      ...data,
    };

    // Сохраняем обновлённые данные
    return await this.repository.update(id, updatedData);
  }

  async updateEmployeeByUserId(userId: number, data: UpdateEmployeeData): Promise<any> {
    // Находим мастера по userId
    const existing = await this.getEmployeeByUserId(userId);
    if (!existing) throw new Error('Мастер не найден');

    if (data.name === '') throw new Error('Имя не может быть пустым');
    if (data.specialization === '') throw new Error('Специализация обязательна');
    
    // Обновляем данные
    return await this.repository.update(existing.id, data);
  }
}