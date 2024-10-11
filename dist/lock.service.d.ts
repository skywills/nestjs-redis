import { Logger, OnApplicationShutdown } from "@nestjs/common";
import Redlock from "redlock";
import { RedisService } from "./redis.service";
import { LockSettings } from "./lock.interface";
export declare class RedisLockService implements OnApplicationShutdown {
    private readonly redisService;
    protected readonly logger: Logger;
    protected readonly redLock: Redlock;
    protected readonly locks: {};
    constructor(redisService: RedisService, lockSettings?: LockSettings);
    onApplicationShutdown(signal?: string): Promise<void>;
    acquireLock(name: string, expiryMs?: number): Promise<void>;
    releaseLock(name: string): Promise<void>;
    withLock<T = any>(name: string, runWithLock: () => Promise<T>, expiryMs?: number): Promise<T>;
}
