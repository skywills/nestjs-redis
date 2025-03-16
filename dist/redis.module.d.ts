import { DynamicModule } from '@nestjs/common';
import { RedisModuleAsyncOptions, RedisModuleOptions } from './redis.interface';
import { LockSettings } from './lock.interface';
export type RedisRegisterOptions = {
    redisOptions: RedisModuleOptions | RedisModuleOptions[];
    lockSettings?: LockSettings;
};
export type RedisRegisterAsyncOptions = {
    redisOptions: RedisModuleAsyncOptions;
    lockSettings?: LockSettings;
};
export declare class RedisModule {
    static register(options: RedisRegisterOptions | RedisModuleOptions | RedisModuleOptions[]): DynamicModule;
    static forRootAsync(options: RedisModuleAsyncOptions | RedisRegisterAsyncOptions): DynamicModule;
    private static createDefaultLockService;
    private static isRegisterOptions;
    private static isRegisterAsyncOptions;
}
