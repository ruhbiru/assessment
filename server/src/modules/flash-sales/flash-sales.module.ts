import { Module } from "@nestjs/common";
import { CacheModule } from "../../providers/cache/cache.module";
import { FlashSalesService } from "./flash-sales.service";
import { MessagingModule } from "../../providers/messaging/messaging.module";

@Module({
  imports: [CacheModule, MessagingModule],
  providers: [FlashSalesService],
  exports: [FlashSalesService],
})
export class FlashSalesModule {}
