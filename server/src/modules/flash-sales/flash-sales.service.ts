import { Inject, Injectable } from "@nestjs/common";
import * as moment from "moment";
import * as _ from "lodash";
import { randomUUID as uuidv4 } from "node:crypto";
import { IFlashSale } from "./flash-sale.interface";
import { FlashSaleCache } from "../../providers/cache/caches/flash-sales/flash-sale.cache";
import { KAFKA_PRODUCER } from "../../providers/messaging/kafka-producer";
import { Producer } from "kafkajs";
import { IOrder } from "../orders/order.interface";
import { OrderEventConstants } from "../orders/order-event.constants";
import { initFlashSalesData } from "./flash-sales.data";

@Injectable()
export class FlashSalesService {
  private flashSales: IFlashSale[];
  constructor(
    @Inject(KAFKA_PRODUCER) private readonly producer: Producer,
    private readonly cache: FlashSaleCache
  ) {
    this.flashSales = initFlashSalesData();
  }

  async getAll() {
    const now = moment.utc();
    const result: { ended: IFlashSale[]; active?: IFlashSale; upcoming: IFlashSale[] } = {
      ended: [],
      upcoming: [],
    };
    return _.reduce(
      this.flashSales,
      (result, flashSale) => {
        if (this.isCurrentTimeBetween(flashSale.startTime, flashSale.endTime, now)) {
          result.active = flashSale;
        } else if (moment(flashSale.endTime).isBefore(now)) {
          result.ended.push(flashSale);
        } else {
          result.upcoming.push(flashSale);
        }
        return result;
      },
      result
    );
  }

  async start() {
    const now = moment.utc();
    const activeFlashSale = _.find(this.flashSales, (flashSale) =>
      this.isCurrentTimeBetween(flashSale.startTime, flashSale.endTime, now)
    );

    await this.cache.init(activeFlashSale!);
  }

  async createOrder(
    order: IOrder
  ): Promise<{ success: boolean; message?: string[]; data?: IOrder }> {
    try {
      const validationResult = await this.validateOrder(order);
      if (!validationResult.success) {
        return validationResult;
      }

      const stock = await this.cache.reserveStock(order.productId);

      if (stock < 0) {
        return { success: false, message: ["Sorry, the product is out of stock!"] };
      }

      order.id = uuidv4();
      order.status = "PENDING";
      await this.cache.setOrderStatus(order.id, order.status);
      await this.producer.send({
        topic: OrderEventConstants.TOPICS.FLASH_SALE_ORDER_CREATE,
        messages: [{ value: JSON.stringify(order) }],
      });

      return { success: true, data: order, message: ["Your order has been requested."] };
    } catch (error) {
      console.error("Failed on handling order request on flash sale.", error);
      return { success: false, message: ["Something went wrong!"] };
    }
  }

  async getOrderStatus(orderId: string) {
    return (await this.cache.getOrderStatus(orderId)) ?? "invalid";
  }

  async validateOrder(order: IOrder) {
    const isInFlashSalePeriod = await this.isInFlashSalePeriod();
    if (!isInFlashSalePeriod) {
      return { success: false, message: ["Sorry, the flash sale has ended."] };
    }

    const hasOrderedProduct = await this.cache.hasOrderedProduct(order.customerId);
    if (hasOrderedProduct) {
      return { success: false, message: ["You can only place one order during this flash sale!"] };
    }

    return { success: true };
  }

  private async isInFlashSalePeriod(now?: moment.Moment) {
    const { startTime, endTime } = await this.cache.getFlashSaleTime();
    return this.isCurrentTimeBetween(startTime, endTime, now);
  }

  private isCurrentTimeBetween(startTime: Date, endTime: Date, now?: moment.Moment) {
    now = now ?? moment.utc();

    const start = moment.utc(startTime);
    const end = moment.utc(endTime);

    return now.isBetween(start, end);
  }
}
