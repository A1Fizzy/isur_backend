export interface CreateOrderRequest {
  customerId: number;
  serviceId: number;
  vehicleId: number;
  preferredTime: string;
  duration: number;
  priority: "NORMAL" | "URGENT";
}

export interface OrderResponse {
  id: number;
  customerId: number;
  serviceId: number;
  employeeId: number | null;
  vehicleId: number;
  preferredTime: string;
  duration: number;
  status: string;
  createdAt: string;
  priority: "NORMAL" | "URGENT";
}