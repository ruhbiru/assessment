import { Module } from "@nestjs/common";
import { KafkaProducer } from "./kafka-producer";
import { KafkaClient } from "./kafka-client";

@Module({
  providers: [KafkaClient, KafkaProducer],
  exports: [KafkaClient, KafkaProducer],
})
export class MessagingModule {}
