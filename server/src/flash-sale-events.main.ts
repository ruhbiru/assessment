import { NestFactory } from "@nestjs/core";
import { FlashSaleEventsHandlersModule } from "./services/flash-sale/flash-sale-events.handlers.module";

async function bootstrap() {
  await NestFactory.createApplicationContext(FlashSaleEventsHandlersModule);
}
bootstrap();
