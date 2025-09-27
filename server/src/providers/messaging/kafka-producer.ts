import { ConfigService } from "@nestjs/config";
import { Kafka, Producer } from "kafkajs";
import { IKafkaOptions } from "../../common/config/interfaces/kafka-options.interface";
import { initTopics } from "./topics-init";

export const KAFKA_PRODUCER = "KafkaProducer";

export const KafkaProducer = {
  provide: KAFKA_PRODUCER,
  useFactory: async (configService: ConfigService) => {
    const options = configService.get<IKafkaOptions>("kafka");
    const kafka = new Kafka({
      clientId: options?.clientId,
      brokers: options?.brokers || [],
    });

    await initTopics(kafka);

    const producer: Producer = kafka.producer();
    await producer.connect();
    return producer;
  },
  inject: [ConfigService],
};
