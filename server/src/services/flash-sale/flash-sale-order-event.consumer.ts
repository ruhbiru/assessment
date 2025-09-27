import { OrderEventConstants } from "../../modules/orders/order-event.constants";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { KAFKA_CLIENT } from "../../providers/messaging/kafka-client";
import { Consumer, Kafka, Producer } from "kafkajs";
import { IOrder } from "../../modules/orders/order.interface";
import { FlashSaleCache } from "../../providers/cache/caches/flash-sales/flash-sale.cache";
import { OrdersService } from "../../modules/orders/orders.service";
import { KAFKA_PRODUCER } from "../../providers/messaging/kafka-producer";
import { OrderStatus } from "../../modules/orders/order-status";

@Injectable()
export class FlashSaleOrderEventHandler implements OnModuleInit {
  constructor(
    @Inject(KAFKA_CLIENT) private readonly kafkaClient: Kafka,
    private readonly flashsaleCache: FlashSaleCache,
    private readonly ordersService: OrdersService,
    @Inject(KAFKA_PRODUCER) private readonly producer: Producer
  ) {}

  async onModuleInit() {
    const consumer: Consumer = this.kafkaClient.consumer({
      groupId: OrderEventConstants.CONSUMER_GROUPS.ORDER_CONSUMERS,
    });
    await consumer.connect();
    await consumer.subscribe({
      topic: OrderEventConstants.TOPICS.FLASH_SALE_ORDER_CREATE,
      fromBeginning: false,
    });

    await consumer.run({
      eachMessage: async ({ message }) => {
        await this.handleCreateOrder(JSON.parse(message?.value?.toString() || ""));
      },
    });
  }

  private async handleCreateOrder(order: IOrder) {
    let status: OrderStatus = "SUCCESS";
    let message: string = "";
    try {
      order.status = status;
      await this.ordersService.createOrder(order);
      await this.flashsaleCache.storeFlashSaleBuyer(order.customerId);
    } catch (error) {
      status = "FAILED";
      message = "Failed on creating order during flash sale.";
      console.log(message, error);
      await this.flashsaleCache.deleteFlashSaleBuyer(order.customerId);
    }

    await this.flashsaleCache.setOrderStatus(order.id!, status);
    await this.producer.send({
      topic: OrderEventConstants.TOPICS.FLASH_SALE_ORDER_STATUS_UPDATE,
      messages: [{ value: JSON.stringify({ id: order.id, status, message }) }],
    });
  }
}
