import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';

const router = Router();
const controller = new OrderController();

router.post('/', controller.createOrder.bind(controller));
router.get('/', controller.getOrders.bind(controller));
router.get('/:id', controller.getOrderById.bind(controller));
router.put('/:id', controller.updateOrder.bind(controller));

export default router;