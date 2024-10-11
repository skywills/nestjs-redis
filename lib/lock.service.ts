import { Injectable, Logger, OnApplicationShutdown } from "@nestjs/common";
import Redlock, { Lock, Settings } from "redlock";
import { RedisService } from "./redis.service";
import { LockSettings } from "./lock.interface";

@Injectable()
export class RedisLockService implements OnApplicationShutdown {
  protected readonly logger = new Logger(RedisLockService.name);

  protected readonly redLock: Redlock;

  protected readonly locks = {};

  constructor(private readonly redisService: RedisService, lockSettings?: LockSettings) {
    const defaultSettings = {
      driftFactor: 0.01, // multiplied by lock ttl to determine drift time
      retryCount: 0,
      retryDelay: 200, // time in ms
      retryJitter: 200, // time in ms
      automaticExtensionThreshold: 500, // time in ms
    };
    const { settings = defaultSettings, scripts } = lockSettings;
    this.redLock = new Redlock([this.redisService.getClient()], settings, scripts);
  }
  async onApplicationShutdown(signal?: string) {
    if (this.redLock) {
      await this.redLock.quit();
    }
  }

  public async acquireLock(name: string, expiryMs = 60000) {
    this.logger.log(`acquireLock redis Lock for ${name}`);
    // throw error if lock failed
    const lock = await this.redLock.acquire([name], expiryMs);
    if (lock) {
      this.locks[name] = lock;
    }
  }

  public async releaseLock(name: string) {
    this.logger.log(`releaseLock redis Lock for ${name}`);
    if (this.locks.hasOwnProperty(name)) {
      try {
        const lock: Lock = this.locks[name];
        await lock.release();
        this.locks[name] = undefined;
      } catch (error) {
        this.logger.log(`releaseLock redis Lock for ${name} error:`, error);
      }
    }
  }

  public async withLock<T = any>(name: string, runWithLock: () => Promise<T>, expiryMs = 60000): Promise<T> {
    await this.acquireLock(name, expiryMs);
    try {
      return await runWithLock();
    } 
    catch(error) {
      throw error;
    }
    finally {
      await this.releaseLock(name);
    } 
  }

}
