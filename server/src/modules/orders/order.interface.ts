import { OrderStatus } from "./order-status";

export interface IOrder {
  id?: string;
  customerId: string;
  productId: string;
  qty: number;
  status?: OrderStatus;
}
