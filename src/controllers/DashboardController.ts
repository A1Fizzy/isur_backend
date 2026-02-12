// src/controllers/DashboardController.ts

import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { UpdateUserProfileInput } from '../types/user';

export class DashboardController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    const userPayload = (req as any).user; // из JWT

    try {
      const user = await this.userService.findById(userPayload.userId);
      if (!user) {
        res.status(404).json({ error: 'Пользователь не найден' });
        return;
      }

      res.json({
        message: 'Профиль загружен',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    const userPayload = (req as any).user;
    const { name, email } = req.body;

    const updateData: UpdateUserProfileInput = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    try {
      const updatedUser = await this.userService.update(userPayload.userId, updateData);

      res.json({
        message: 'Профиль успешно обновлён',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email
        }
      });
    } catch (error: any) {
      if (error.message.includes('Unique constraint')) {
        res.status(409).json({ error: 'Пользователь с таким email уже существует' });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }
}