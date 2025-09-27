const dotenv = require("dotenv");
dotenv.config();

const configFactory = () => ({
  app: {
    port: "7000",
    sseKeepAliveInterval: parseInt(process.env.SSE_KEEPALIVE_INTERVAL ?? "30000"),
  },
  logger: {
    console: {
      level: "silly",
      colorize: true,
      timestamp: true,
      json: false,
    },
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT || 6379,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    tls: process.env.REDIS_TLS_ENABLED === "true" && {},
  },
  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID || "assessment-test",
    brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
  },
});

module.exports = configFactory;
