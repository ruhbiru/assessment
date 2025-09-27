import { ConfigService } from "@nestjs/config";
import { Kafka } from "kafkajs";
import { IKafkaOptions } from "../../common/config/interfaces/kafka-options.interface";

export const KAFKA_CLIENT = "KafkaClient";

export const KafkaClient = {
  provide: KAFKA_CLIENT,
  useFactory: async (configService: ConfigService) => {
    const options = configService.get<IKafkaOptions>("kafka");
    const kafka = new Kafka({
      clientId: options?.clientId,
      brokers: options?.brokers || [],
    });

    return kafka;
  },
  inject: [ConfigService],
};
