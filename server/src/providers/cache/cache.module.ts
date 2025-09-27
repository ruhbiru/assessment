import { Module } from "@nestjs/common";
import { CacheClient } from "./cache-client";
import { FlashSaleCache } from "./caches/flash-sales/flash-sale.cache";
import { ConfigModule } from "../../common/config/config.module";
import { OrderStorage } from "./caches/orders/orders-storage";

@Module({
  imports: [ConfigModule],
  providers: [CacheClient, FlashSaleCache, OrderStorage],
  exports: [FlashSaleCache, OrderStorage],
})
export class CacheModule {}
