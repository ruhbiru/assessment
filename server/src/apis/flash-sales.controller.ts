import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  OnModuleInit,
  Param,
  Post,
  Res,
  Sse,
} from "@nestjs/common";
import { Response } from "express";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { FlashSalesService } from "../modules/flash-sales/flash-sales.service";
import { FlashSaleOrderRequestDto } from "../modules/flash-sales/models/requests/flash-sale-order.request-dto";
import { OrdersService } from "../modules/orders/orders.service";
import { Consumer, Kafka } from "kafkajs";
import { KAFKA_CLIENT } from "../providers/messaging/kafka-client";
import { OrderEventConstants } from "../modules/orders/order-event.constants";
import { Observable } from "rxjs";
import { OrderStatus } from "../modules/orders/order-status";

@Controller("flash-sales")
export class FlashSalesController implements OnModuleInit {
  constructor(
    private readonly service: FlashSalesService,
    private readonly ordersService: OrdersService,
    @Inject(KAFKA_CLIENT) private readonly kafkaClient: Kafka,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async onModuleInit() {
    const consumer: Consumer = this.kafkaClient.consumer({
      groupId: "order-update-status-appId:xxxx",
    });
    await consumer.connect();
    await consumer.subscribe({
      topic: OrderEventConstants.TOPICS.FLASH_SALE_ORDER_STATUS_UPDATE,
      fromBeginning: false,
    });

    await consumer.run({
      eachMessage: async ({ message }) => {
        await this.eventEmitter.emit(
          "order-status.update",
          JSON.parse(message?.value?.toString() || "")
        );
      },
    });
  }
  @Get("status")
  async getStatus() {
    const data = await this.service.getAll();
    return { success: true, statusCode: HttpStatus.OK, data };
  }

  @Post("order")
  async order(@Body() data: FlashSaleOrderRequestDto, @Res() res: Response) {
    const response = await this.service.createOrder(data);
    const statusCode = response.success ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST;
    return res.status(statusCode).json({
      ...response,
      statusCode,
    });
  }

  @Sse("/order/:id/status-stream")
  orderStream(
    @Param("id") id: string
  ): Observable<MessageEvent<{ status: OrderStatus; message?: string }>> {
    return new Observable((subscriber) => {
      const handler = (data: { id: string; status: OrderStatus; message?: string }) => {
        if (data.id === id) {
          subscriber.next(
            new MessageEvent("message", {
              data: { status: data.status, message: data.message },
            })
          );
          if (data.status !== "PENDING") {
            subscriber.complete();
          }
        }
      };

      this.eventEmitter.on("order-status.update", handler);

      return () => {
        this.eventEmitter.off("order-status.update", handler);
      };
    });
  }

  @Get("order/:id/status")
  async getOrderStatus(@Param() { id }: { id: string }) {
    const status = await this.service.getOrderStatus(id);
    return {
      success: true,
      message: status === "SUCCESS" ? ["Order placed successfully."] : undefined,
      statusCode: HttpStatus.OK,
      data: status,
    };
  }

  // for testing purposes
  @Get("orders")
  async getOrders() {
    const data = await this.ordersService.getAll();
    return { success: true, statusCode: HttpStatus.OK, data };
  }
}
