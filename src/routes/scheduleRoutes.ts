import { Router } from 'express';
import { ScheduleController } from '../controllers/ScheduleController';
import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const controller = new ScheduleController();

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ разрешён только администратору' });
  }
  next();
}

// 🛡️ Все маршруты требуют авторизации
router.use(authMiddleware);

// Текущее расписание (уже назначенные работы)
router.get('/', controller.getSchedule);

// Рекомендации от интеллектуального планировщика
router.get('/recommend', requireAdmin, controller.getRecommendations);
router.post('/apply-recommendations', requireAdmin, controller.applyRecommendations);

export default router;