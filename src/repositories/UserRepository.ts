import prisma from '../config/database';
import { User } from '@prisma/client';

interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: "master";
}

export class UserRepository {
  async create(data: CreateUserInput): Promise<User> {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: "master",
      },
    });
    if (data.role === 'master') {
      await prisma.employee.create({
        data: {
          userId: user.id,
          specialization: 'не указана',
          name: user.name,
        },
      });

    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: number): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: number, data: any): Promise<any> {
    return await prisma.user.update({
      where: { id },
      data
    });
  }
}