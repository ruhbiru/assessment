import { Inject, Injectable } from "@nestjs/common";
import { compact, map } from "lodash";

import Redis from "ioredis";
import { BaseCache } from "../../base.cache";
import { CACHE_CLIENT } from "../../cache-client";
import { IOrder } from "../../../../modules/orders/order.interface";

@Injectable()
export class OrderStorage extends BaseCache {
  constructor(@Inject(CACHE_CLIENT) cacheClient: Redis) {
    super(cacheClient, "storage", "orders");
  }

  getOrder(orderId: string) {
    return this.get<IOrder>(orderId);
  }

  storeOrder(orderId: string, order: IOrder) {
    return this.set(order, orderId);
  }

  async getAll() {
    const keys = await this.cacheClient.keys(this.getCompleteKey("*"));
    let orders: (string | null)[] = [];
    if (keys.length > 0) {
      orders = await this.cacheClient.mget(...keys);
    }

    return map(compact(orders), (p) => JSON.parse(p));
  }
}
