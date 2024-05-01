import { DynamicModule, Module, Provider } from '@nestjs/common';
import { RedisModuleAsyncOptions, RedisModuleOptions } from './redis.interface';
import { RedisCoreModule } from './redis-core.module';
import { RedisLockService } from './lock.service';
import { RedisService } from './redis.service';
import { LockSettings } from './lock.interface';
import { LOCK_SETTINGS } from './lock.constants';

export type RedisRegisterOptions = {
  redisOptions: RedisModuleOptions | RedisModuleOptions[];
  lockSettings?: LockSettings;
}

export type RedisRegisterAsyncOptions = {
  redisOptions: RedisModuleAsyncOptions;
  lockSettings?: LockSettings;
}

const defaultLockSetting: LockSettings = {
  settings: {
    driftFactor: 0.01, // multiplied by lock ttl to determine drift time
    retryCount: 0,
    retryDelay: 200, // time in ms
    retryJitter: 200, // time in ms
    automaticExtensionThreshold: 500, // time in ms
  },
}

@Module({})
export class RedisModule {
  static register(
    options: RedisRegisterOptions | RedisModuleOptions | RedisModuleOptions[],
  ): DynamicModule {

    let redisOptions: RedisModuleOptions | RedisModuleOptions[];
    let lockSettings: LockSettings;

    if(this.isRegisterOptions(options)) {
      redisOptions = options.redisOptions;
      lockSettings = options.lockSettings;
    } else {
      redisOptions = options;
    }

    const lockSetting: Provider = {
      provide: LOCK_SETTINGS,
      useValue: lockSettings || defaultLockSetting,
    }

    const lockService = this.createDefaultLockService();

    return {
      module: RedisModule,
      imports: [RedisCoreModule.register(redisOptions)],
      providers: [lockSetting, lockService],
      exports: [lockSetting, lockService]
    };
  }

  static forRootAsync(options: RedisModuleAsyncOptions | RedisRegisterAsyncOptions): DynamicModule {
    let redisOptions: RedisModuleAsyncOptions;
    let lockSettings: LockSettings;

    if(this.isRegisterAsyncOptions(options)) {
      redisOptions = options.redisOptions;
      lockSettings = options.lockSettings;
    } else {
      redisOptions = options;
    }

    const lockSetting: Provider = {
      provide: LOCK_SETTINGS,
      useValue: lockSettings || defaultLockSetting,
    }

    const lockService = this.createDefaultLockService();

    return {
      module: RedisModule,
      imports: [RedisCoreModule.forRootAsync(redisOptions)],
      providers: [lockSetting, lockService],
      exports: [lockSetting, lockService]
    };
  }


  private static createDefaultLockService(): Provider {
    return {
      provide: RedisLockService,
      useFactory: (redisService: RedisService, lockSetting: LockSettings) => new RedisLockService(redisService, lockSetting),
      inject: [RedisService, LOCK_SETTINGS],
    };
  }

  private static isRegisterOptions(options: RedisRegisterOptions | RedisModuleOptions | RedisModuleOptions[]): options is RedisRegisterOptions {
    return 'redisOptions' in options || 'lockSettings' in options;
  }

  private static isRegisterAsyncOptions(options: RedisRegisterAsyncOptions | RedisModuleAsyncOptions): options is RedisRegisterAsyncOptions {
    return 'redisOptions' in options || 'lockSettings' in options;
  }
}