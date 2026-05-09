import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { comparePassword } from '../utils/hash';
import { signToken } from '../utils/jwt';

export class AuthController {
  private service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  async register(req: Request, res: Response): Promise<void> {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Все поля обязательны' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' });
      return;
    }

    try {
      const user = await this.service.createUser({
        name,
        email,
        password,
      });

      res.status(201).json({ 
        message: 'Пользователь успешно зарегистрирован', 
        userId: user.id 
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        res.status(409).json({ error: 'Пользователь с таким email уже существует' });
      } else {
        res.status(500).json({ error: 'Ошибка сервера' });
      }
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email и пароль обязательны' });
      return;
    }

    try {
      const user = await this.service.findByEmail(email);
      if (!user) {
        res.status(401).json({ error: 'Неверный email или пароль' });
        return;
      }

      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        console.log('пароль')
        res.status(401).json({ error: 'Неверный email или пароль' });
        return;
      }

      const token = signToken(user.id, user.role);

      res.json({
        message: 'Авторизация успешна',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
}