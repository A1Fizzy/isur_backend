import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const controller = new ReportController();

router.get('/completed', authMiddleware, (req, res) => controller.getCompletedOrders(req, res));
router.get('/vehicle/:vehicleId', authMiddleware, (req, res) => controller.getVehicleHistory(req, res));

export default router;