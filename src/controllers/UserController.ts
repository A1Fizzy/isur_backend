import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { EmployeeService } from '../services/EmployeeService';

export class UserController {
    private service: UserService;
    private employeeService: EmployeeService;

    constructor(service: UserService = new UserService(), employeeService: EmployeeService = new EmployeeService()) {
        this.service = service;
        this.employeeService = employeeService;
      }

    async deleteUser(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      res.status(400).json({ error: 'Некорректный ID пользователя' });
      return;
    }

    try {
      const employee = await this.employeeService.getEmployeeByUserId(id);

      if (employee) {
        // Удаляем мастера перед удалением пользователя
        await this.employeeService.deleteEmployee(employee.id);
        console.log(`Мастер с ID=${employee.id} удален`); 
      }
      await this.service.deleteUser(id);
      res.status(204).send(); // Успешно удалено
    } catch (error: any) {
      console.error('Ошибка при удалении пользователя:', error);
      const status = error.statusCode || 500;
      res.status(status).json({ 
        error: error.message || 'Не удалось удалить пользователя' 
      });
    }
  
  }
}