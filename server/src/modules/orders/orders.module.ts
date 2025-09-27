import { Module } from "@nestjs/common";
import { CacheModule } from "../../providers/cache/cache.module";
import { OrdersService } from "./orders.service";

@Module({
  imports: [CacheModule],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
