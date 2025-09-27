import { Injectable } from "@nestjs/common";
import { randomUUID as uuidv4 } from "node:crypto";
import { OrderStorage } from "../../providers/cache/caches/orders/orders-storage";
import { IOrder } from "./order.interface";

@Injectable()
export class OrdersService {
  constructor(private readonly orderStorage: OrderStorage) {}

  async getAll() {
    return this.orderStorage.getAll();
  }

  async createOrder(order: IOrder) {
    order.id = order.id ?? uuidv4();
    await this.orderStorage.storeOrder(order.id, order);
    return order;
  }
}
