"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RedisModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisModule = void 0;
const common_1 = require("@nestjs/common");
const redis_core_module_1 = require("./redis-core.module");
const lock_service_1 = require("./lock.service");
const redis_service_1 = require("./redis.service");
const lock_constants_1 = require("./lock.constants");
const defaultLockSetting = {
    settings: {
        driftFactor: 0.01,
        retryCount: 0,
        retryDelay: 200,
        retryJitter: 200,
        automaticExtensionThreshold: 500,
    },
};
let RedisModule = RedisModule_1 = class RedisModule {
    static register(options) {
        let redisOptions;
        let lockSettings;
        if (this.isRegisterOptions(options)) {
            redisOptions = options.redisOptions;
            lockSettings = options.lockSettings;
        }
        else {
            redisOptions = options;
        }
        const lockSetting = {
            provide: lock_constants_1.LOCK_SETTINGS,
            useValue: lockSettings || defaultLockSetting,
        };
        const lockService = this.createDefaultLockService();
        return {
            module: RedisModule_1,
            imports: [redis_core_module_1.RedisCoreModule.register(redisOptions)],
            providers: [lockSetting, lockService],
            exports: [lockSetting, lockService]
        };
    }
    static forRootAsync(options) {
        let redisOptions;
        let lockSettings;
        if (this.isRegisterAsyncOptions(options)) {
            redisOptions = options.redisOptions;
            lockSettings = options.lockSettings;
        }
        else {
            redisOptions = options;
        }
        const lockSetting = {
            provide: lock_constants_1.LOCK_SETTINGS,
            useValue: lockSettings || defaultLockSetting,
        };
        const lockService = this.createDefaultLockService();
        return {
            module: RedisModule_1,
            imports: [redis_core_module_1.RedisCoreModule.forRootAsync(redisOptions)],
            providers: [lockSetting, lockService],
            exports: [lockSetting, lockService]
        };
    }
    static createDefaultLockService() {
        return {
            provide: lock_service_1.RedisLockService,
            useFactory: (redisService, lockSetting) => new lock_service_1.RedisLockService(redisService, lockSetting),
            inject: [redis_service_1.RedisService, lock_constants_1.LOCK_SETTINGS],
        };
    }
    static isRegisterOptions(options) {
        return 'redisOptions' in options || 'lockSettings' in options;
    }
    static isRegisterAsyncOptions(options) {
        return 'redisOptions' in options || 'lockSettings' in options;
    }
};
RedisModule = RedisModule_1 = __decorate([
    (0, common_1.Module)({})
], RedisModule);
exports.RedisModule = RedisModule;
