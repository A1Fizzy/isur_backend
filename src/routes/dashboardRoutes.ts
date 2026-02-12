import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { DashboardController } from '../controllers/DashboardController';

const router = Router();
const controller = new DashboardController();

router.get('/', authMiddleware, controller.getProfile.bind(controller));
router.put('/', authMiddleware, controller.updateProfile.bind(controller));

export default router;