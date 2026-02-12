import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];

  // Проверяем наличие заголовка
  if (!authHeader || typeof authHeader !== 'string') {
    res.status(401).json({ error: 'Требуется авторизация' });
    return; 
  }

  // Извлекаем токен из "Bearer <token>"
  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Токен отсутствует в заголовке Authorization' });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(403).json({ error: 'Неверный или просроченный токен' });
    return;
  }

  // Расширяем Request, чтобы добавить user
  (req as any).user = payload; // содержит userId, role
  next(); 
};