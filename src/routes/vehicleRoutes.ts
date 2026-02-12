import { Router } from 'express';
import { VehicleController } from '../controllers/VehicleController';

const router = Router();
const controller = new VehicleController();

router.post('/', controller.createVehicle.bind(controller));
router.get('/', controller.getAllVehicles.bind(controller));
router.get('/:id', controller.getVehicleById.bind(controller));
router.put('/:id', controller.getVehicleById.bind(controller));

export default router;