import { Router, Request, Response, NextFunction } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const controller = new UserController();

router.use(authMiddleware);

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ разрешён только администратору' });
  }
  next();
}

router.delete('/:id', requireAdmin, controller.deleteUser.bind(controller));

export default router;