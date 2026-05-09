import { User } from '@prisma/client';
import { UserRepository } from '../repositories/UserRepository';
import { UpdateUserProfileInput } from '../types/user';

export class UserService {
  private repository: UserRepository;

  constructor() {
    this.repository = new UserRepository();
  }

  async findById(id: number): Promise<User | null> {
    return await this.repository.getById(id);
  }

  async update(id: number, data: UpdateUserProfileInput): Promise<User> {
    if (!data.name && !data.email) {
      throw new Error('Необходимо указать хотя бы одно поле для обновления');
    }

    // Здесь можно добавить дополнительную валидацию
    if (data.email && !/\S+@\S+\.\S+/.test(data.email)) {
      throw new Error('Некорректный формат email');
    }

    return await this.repository.update(id, data);
  }
  async deleteUser(id: number): Promise<void> {
    const user = await this.repository.getById(id);
    if (!user) {
      throw new Error('Пользователь не найден');
    }
    await this.repository.delete(id);
  }
}