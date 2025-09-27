import { Inject, Injectable } from "@nestjs/common";

import Redis from "ioredis";
import { BaseCache } from "../../base.cache";
import { CACHE_CLIENT } from "../../cache-client";
import { IFlashSale } from "../../../../modules/flash-sales/flash-sale.interface";
import { OrderStatus } from "../../../../modules/orders/order-status";

@Injectable()
export class FlashSaleCache extends BaseCache {
  private TIME_KEY = "time";
  private BUYER_KEY = "buyers";
  private ORDER_KEY = "orders";

  constructor(@Inject(CACHE_CLIENT) cacheClient: Redis) {
    super(cacheClient, "flash-sales", "active");
  }

  async getFlashSaleTime() {
    const key = this.getCompleteKey(this.TIME_KEY);
    const meta = await this.cacheClient.hgetall(key);
    const startTime = new Date(meta.startTime);
    const endTime = new Date(meta.endTime);
    return { startTime, endTime };
  }

  async storeFlashSaleBuyer(customerId: string) {
    await this.set(true, this.BUYER_KEY, customerId);
  }

  async deleteFlashSaleBuyer(customerId: string) {
    await this.del(this.BUYER_KEY, customerId);
  }

  async hasOrderedProduct(customerId: string) {
    return !!(await this.get(this.BUYER_KEY, customerId)) || false;
  }

  async init(flashSale: IFlashSale) {
    await this.set(flashSale, "data");
    await this.set(flashSale.id, "id");
    await this.deleteByPartialKeys(this.BUYER_KEY);
    await this.setFlashSaleTime(flashSale);
    await this.setStock(flashSale.product.stock, flashSale.product.id);
  }

  private async setFlashSaleTime(flashSale: IFlashSale) {
    const key = this.getCompleteKey(this.TIME_KEY);
    await this.cacheClient.hset(key, {
      startTime: flashSale.startTime.toISOString(),
      endTime: flashSale.endTime.toISOString(),
    });
  }

  private async setStock(stock: number, productId: string) {
    const stockKey = this.getStockKey(productId);
    await this.set(stock, stockKey);
  }

  async reserveStock(productId: string): Promise<number> {
    const stockKey = this.getCompleteKey(this.getStockKey(productId));

    const luaScript = `
      local stock = tonumber(redis.call('GET', KEYS[1]))
      if stock == nil then
        return -2
      end
      if stock > 0 then
        redis.call('DECR', KEYS[1])
        return stock - 1
      else
        return -1
      end
    `;

    const result = await this.cacheClient.eval(luaScript, 1, stockKey);

    // result meaning:
    // -1 → Out of stock
    // -2 → Key not found
    // >= 0 → Remaining stock
    return result as number;
  }

  private getStockKey(productId: string) {
    return `product:${productId}:stock`;
  }

  async setOrderStatus(orderId: string, status: OrderStatus) {
    await this.set(status, this.ORDER_KEY, orderId);
  }

  async getOrderStatus(orderId: string) {
    return await this.get<string>(this.ORDER_KEY, orderId);
  }
}
