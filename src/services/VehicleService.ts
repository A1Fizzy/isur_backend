import { Vehicle } from '@prisma/client';
import { VehicleRepository } from '../repositories/VehicleRepository';

interface CreateVehicleData {
  plateNumber: string;
  model: string;
  year: number;
  status: string;
}

interface UpdateVehicleData {
  plateNumber?: string;
  model?: string;
  year?: number;
  status?: string;
}

export class VehicleService {
  private repository: VehicleRepository;

  constructor() {
    this.repository = new VehicleRepository();
  }

  async createVehicle(data: CreateVehicleData): Promise<Vehicle> {
    // Проверка на корректность данных
    if (!data.plateNumber || !data.model || !data.year || !data.status) {
      throw new Error('Все поля обязательны');
    }

    if (data.year < 1900 || data.year > new Date().getFullYear()) {
      throw new Error('Некорректный год выпуска');
    }

    return await this.repository.create(data);
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    return await this.repository.findAll();
  }

  async getVehicleById(id: number): Promise<Vehicle | null> {
    return await this.repository.findById(id);
  }
  async updateVehicle(id: number, data: UpdateVehicleData): Promise<any> {
    // Поиск существующего автомобиля
    const existingVehicle = await this.repository.findById(id);
    if (!existingVehicle) {
      throw new Error('Автомобиль не найден');
    }

    // Валидация входящих данных
    if (data.plateNumber === '') {
      throw new Error('Госномер не может быть пустым');
    }

    if (data.model === '') {
      throw new Error('Модель не может быть пустой');
    }

    if (data.year !== undefined) {
      if (data.year < 1900 || data.year > new Date().getFullYear()) {
        throw new Error('Некорректный год выпуска');
      }
    }

    // Объединяем старые данные с новыми
    const updatedData = {
      ...existingVehicle,
      ...data,
    };

    // Сохраняем обновлённые данные
    return await this.repository.update(id, updatedData);
  }
}