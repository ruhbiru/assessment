import * as _ from "lodash";
import { Injectable } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class BaseCache {
  constructor(
    protected readonly cacheClient: Redis,
    protected scope: string,
    protected entityType: string
  ) {}

  async get<T>(...keys: string[]): Promise<T | undefined> {
    const value = await this.cacheClient.get(this.getCompleteKey(...keys));
    return value ? JSON.parse(value) : undefined;
  }

  async set(value: any, ...keys: string[]) {
    await this.cacheClient.set(this.getCompleteKey(...keys), JSON.stringify(value));
  }

  // ttl: the number of seconds that data will last in storage
  async setWithExpiry(value: any, ttl?: number, ...keys: string[]) {
    if (ttl) {
      await this.cacheClient.set(this.getCompleteKey(...keys), JSON.stringify(value), "EX", ttl);
    } else {
      await this.cacheClient.set(this.getCompleteKey(...keys), JSON.stringify(value));
    }
  }

  del(...keys: string[]) {
    return this.cacheClient.del(this.getCompleteKey(...keys));
  }

  async deleteByPartialKeys(...partialKeys: string[]) {
    const prefix = this.getCompleteKey(...partialKeys);
    try {
      var stream = this.cacheClient.scanStream({
        // only returns keys following the pattern of "prefix"
        match: `${prefix}:*`,
        // returns approximately 100 elements per call
        count: 100,
      });

      var keys: string[] = [];
      const cacheClient = this.cacheClient;

      stream.on("data", function (resultKeys) {
        // `resultKeys` is an array of strings representing key names
        for (var i = 0; i < resultKeys.length; i++) {
          keys.push(resultKeys[i]);
        }
      });
      stream.on("end", async function () {
        if (keys.length) {
          return await cacheClient.unlink(keys);
        }
      });
    } catch (error) {
      console.error(`Failed to clean cache by prefix: "${prefix}".`, error);
    }
  }

  protected getCompleteKey(...partialKeys: string[]): string {
    return `${this.scope}:${this.entityType}:${_.join(partialKeys, ":")}`;
  }
}
