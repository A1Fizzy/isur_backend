export interface CreateOrderRequest {
  customerId: number;
  serviceId: number;
  preferredTime: string;
  duration: number;
}

export interface OrderResponse {
  id: number;
  customerId: number;
  serviceId: number;
  employeeId: number | null;
  preferredTime: string;
  duration: number;
  status: string;
  createdAt: string;
}