import {
  CacheModule, MiddlewareConsumer, Module, NestModule
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SequelizeModule } from '@nestjs/sequelize';
import * as redisStore from 'cache-manager-redis-store';
import { Dialect } from 'sequelize/types';
import { JwtMiddleware } from './common/middlewares/jwt.middleware';
import { customModules } from './custom-modules';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: configService.get<string>('DB_DIALECT') as Dialect,
        dialectOptions: {
          ssl: {
            rejectUnauthorized: false,
            
          },
        },
        host: configService.get<string>('DB_HOST'),
        port: +configService.get<string>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE_NAME'),
        autoLoadModels: true,
        synchronize: false,
        pool: {
          max: 20,
          min: 0,
          acquire: 60000,
          idle: 10000,
        },
      }),
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        ttl: configService.get<string>('CACHE_TTL'),
        store: redisStore,
        // host: configService.get<string>('CACHE_HOST'),
        // port: 6379,
        url: configService.get<string>('CACHE_URL'),
        tls: {
          rejectUnauthorized: false,
        },
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    ...customModules,
  ],
  controllers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes('*');
  }
}
