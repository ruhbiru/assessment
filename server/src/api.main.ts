import { NestFactory } from "@nestjs/core";
import { ApisModule } from "./apis/apis.module";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { FlashSalesService } from "./modules/flash-sales/flash-sales.service";

async function bootstrap() {
  const app = await NestFactory.create(ApisModule);
  app.setGlobalPrefix("api");

  const config = app.get(ConfigService);
  const appConfig = config.get("app");

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Ideally, we should use a scheduler to trigger the start or end of the flash sales.
  // The logic here is mainly for setting up the flash sales metadata in Redis.
  const flashSalesService = app.get(FlashSalesService);
  await flashSalesService.start();

  await app.listen(appConfig.port);
}
bootstrap();
