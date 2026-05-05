import { Router, Request, Response, NextFunction } from 'express';
import { ServiceController } from '../controllers/ServiceController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const controller = new ServiceController();

router.use(authMiddleware);

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ разрешён только администратору' });
  }
  next();
}

// Публичные маршруты
router.get('/', controller.getAllServices.bind(controller));

// Только для администраторов
router.post('/', requireAdmin, controller.createService.bind(controller));
router.get('/:id', requireAdmin, controller.getServiceById.bind(controller));
router.put('/:id', requireAdmin, controller.updateService.bind(controller));
router.delete('/:id', requireAdmin, controller.deleteService.bind(controller));

export default router;