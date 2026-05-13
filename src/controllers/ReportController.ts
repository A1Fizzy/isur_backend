import { Request, Response } from "express";
import prisma from "../config/database";

export class ReportController {
  async getCompletedOrders(req: Request, res: Response) {
    try {
      const orders = await prisma.order.findMany({
        where: { status: "completed" },
        include: {
          customer: true,
          vehicle: true,
          service: true,
          employee: true,
        },
        orderBy: { preferredTime: "desc" },
      });

      const formatted = orders.map((o) => ({
        id: o.id,
        customerName: o.customer.name,
        vehiclePlate: o.vehicle?.plateNumber,
        vehicleModel: o.vehicle?.model,
        serviceName: o.service.name,
        service: {
          id: o.service.id,
          name: o.service.name,
          duration: o.service.duration, // ← теперь здесь
        },
        employeeName: o.employee?.name || null,
        preferredTime: o.preferredTime.toISOString(),
        status: o.status,
      }));

      res.json(formatted);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Ошибка загрузки отчёта" });
    }
  }

  // GET /api/reports/vehicle/:vehicleId
  async getVehicleHistory(req: Request, res: Response) {
    const vehicleId = parseInt(req.params.vehicleId, 10);
    if (isNaN(vehicleId))
      return res.status(400).json({ error: "Неверный ID авто" });

    try {
      const orders = await prisma.order.findMany({
        where: { vehicleId },
        include: {
          customer: true,
          vehicle: true,
          service: true,
          employee: true,
        },
        orderBy: { preferredTime: "desc" },
      });

      const formatted = orders.map((o) => ({
        id: o.id,
        customerName: o.customer.name,
        vehiclePlate: o.vehicle?.plateNumber,
        vehicleModel: o.vehicle?.model,
        serviceName: o.service.name,
        service: {
          id: o.service.id,
          name: o.service.name,
          duration: o.service.duration,
        },
        employeeName: o.employee?.name || null,
        preferredTime: o.preferredTime.toISOString(),
        duration: o.duration,
        status: o.status,
      }));

      res.json(formatted);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Ошибка загрузки истории авто" });
    }
  }
}
