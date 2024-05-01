"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RedisLockService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisLockService = void 0;
const common_1 = require("@nestjs/common");
const redlock_1 = require("redlock");
const redis_service_1 = require("./redis.service");
let RedisLockService = RedisLockService_1 = class RedisLockService {
    constructor(redisService, lockSettings) {
        this.redisService = redisService;
        this.logger = new common_1.Logger(RedisLockService_1.name);
        this.locks = {};
        const defaultSettings = {
            driftFactor: 0.01,
            retryCount: 0,
            retryDelay: 200,
            retryJitter: 200,
            automaticExtensionThreshold: 500,
        };
        const { settings = defaultSettings, scripts } = lockSettings;
        this.redLock = new redlock_1.default([this.redisService.getClient()], settings, scripts);
    }
    async onApplicationShutdown(signal) {
        if (this.redLock) {
            await this.redLock.quit();
        }
    }
    async acquireLock(name, expiryMs = 60000) {
        this.logger.log(`acquireLock redis Lock for ${name}`);
        const lock = await this.redLock.acquire([name], expiryMs);
        if (lock) {
            this.locks[name] = lock;
        }
    }
    async releaseLock(name) {
        this.logger.log(`releaseLock redis Lock for ${name}`);
        if (this.locks.hasOwnProperty(name)) {
            try {
                const lock = this.locks[name];
                await lock.release();
                this.locks[name] = undefined;
            }
            catch (error) {
                this.logger.log(`releaseLock redis Lock for ${name} error:`, error);
            }
        }
    }
};
RedisLockService = RedisLockService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService, Object])
], RedisLockService);
exports.RedisLockService = RedisLockService;
