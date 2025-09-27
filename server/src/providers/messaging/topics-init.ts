import { Kafka } from "kafkajs";
import { OrderEventConstants } from "../../modules/orders/order-event.constants";

export const initTopics = async (kafka: Kafka) => {
  const admin = kafka.admin();
  await admin.connect();

  const topicsToEnsure = [
    OrderEventConstants.TOPICS.FLASH_SALE_ORDER_CREATE,
    OrderEventConstants.TOPICS.FLASH_SALE_ORDER_STATUS_UPDATE,
  ];

  const existingTopics = await admin.listTopics();

  const topicsToCreate = topicsToEnsure
    .filter((topic) => !existingTopics.includes(topic))
    .map((topic) => ({
      topic,
      numPartitions: 1,
      replicationFactor: 1,
    }));

  if (topicsToCreate.length > 0) {
    await admin.createTopics({
      topics: topicsToCreate,
    });
  }

  await admin.disconnect();
};
