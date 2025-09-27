import { Module } from "@nestjs/common";
import { FlashSaleOrderEventHandler } from "./flash-sale-order-event.consumer";
import { MessagingModule } from "../../providers/messaging/messaging.module";
import { CacheModule } from "../../providers/cache/cache.module";
import { OrdersModule } from "../../modules/orders/orders.module";

@Module({
  imports: [CacheModule, MessagingModule, OrdersModule],
  providers: [FlashSaleOrderEventHandler],
  exports: [FlashSaleOrderEventHandler],
})
export class FlashSaleEventsHandlersModule {}
