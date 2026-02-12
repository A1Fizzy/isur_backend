import { Router } from 'express';
import { ScheduleController } from '../controllers/ScheduleController';

const router = Router();
const controller = new ScheduleController();

router.get('/', controller.getSchedule);

export default router;