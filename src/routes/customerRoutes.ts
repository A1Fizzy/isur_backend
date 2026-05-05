import { Router, Request, Response, NextFunction } from 'express';
import { CustomerController } from '../controllers/CustomerController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const controller = new CustomerController();

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ разрешён только администратору' });
  }
  next();
}

router.use(authMiddleware);

// Публичные маршруты
router.get('/', controller.getAllCustomers.bind(controller));

// Только для администраторов
router.post('/', requireAdmin, controller.createCustomer.bind(controller));
router.get('/:id', requireAdmin, controller.getCustomerById.bind(controller));
router.put('/:id', requireAdmin, controller.updateCustomer.bind(controller));
router.delete('/:id', requireAdmin, controller.deleteCustomer.bind(controller));

export default router;