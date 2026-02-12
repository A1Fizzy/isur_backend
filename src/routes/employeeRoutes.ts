import { Router } from 'express';
import { EmployeeController } from '../controllers/EmployeeController';

const router = Router();
const controller = new EmployeeController();

router.post('/', controller.createEmployee.bind(controller));
router.get('/', controller.getAllEmployees.bind(controller));
router.get('/:id', controller.getEmployeeById.bind(controller));
router.get('/userId/:userId', controller.getEmployeeByUserId.bind(controller));
router.put('/:id', controller.updateEmployee.bind(controller));
router.put('/userId/:id', controller.updateByUserId.bind(controller));

export default router;