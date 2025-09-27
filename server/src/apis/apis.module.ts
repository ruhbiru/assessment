import { Module } from "@nestjs/common";
import { FlashSalesController } from "./flash-sales.controller";
import { FlashSalesModule } from "../modules/flash-sales/flash-sales.module";
import { OrdersModule } from "../modules/orders/orders.module";
import { StaticModule } from "../modules/static.module";
import { MessagingModule } from "../providers/messaging/messaging.module";
import { EventEmitterModule } from "@nestjs/event-emitter";

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    FlashSalesModule,
    MessagingModule,
    OrdersModule,
    StaticModule,
  ],
  controllers: [FlashSalesController],
})
export class ApisModule {}
