import { User } from '@prisma/client';
import { UserRepository } from '../repositories/UserRepository';
import { hashPassword } from '../utils/hash';

// Интерфейс для данных создания пользователя
interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

export class AuthService {
  private repository: UserRepository;

  constructor() {
    this.repository = new UserRepository();
  }

  async createUser(data: CreateUserInput): Promise<User> {
    const hashed = await hashPassword(data.password);
    return await this.repository.create({
      ...data,
      password: hashed,
      role: 'master',
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findByEmail(email);
  }
}