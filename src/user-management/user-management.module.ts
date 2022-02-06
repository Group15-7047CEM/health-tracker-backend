import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import * as redisStore from 'cache-manager-redis-store';
import { AuthenticationService } from '../authentication/authentication.service';
import { JwtStrategy } from '../authentication/strategies/jwt.strategy';
import {
  UserConsentModel, UserDeviceTokenModel, UserModel, UserOnbardingProgressModel, UserPasswordsModel, UserSearchModel
} from './models';
import { UserOnboardingService } from './providers/onboarding.service';
import {
  UserOnboardingRepository,
  UserRepository, UserSearchRepository
} from './repositories';
import { UserManagementController } from './user-management.controller';
import { UserManagementService } from './user-management.service';


@Module({
  imports: [
    ConfigModule,
    SequelizeModule.forFeature([
      UserModel,
      UserDeviceTokenModel,
      UserPasswordsModel,
      UserConsentModel,
      UserSearchModel,
      UserOnbardingProgressModel
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        // signOptions: { expiresIn: '1h' },
      }),
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        ttl: configService.get<string>('CACHE_TTL'),
        store: redisStore,
        host: configService.get<string>('CACHE_HOST'),
        port: 6379,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UserManagementController],
  providers: [
    UserRepository,
    UserManagementService,
    JwtStrategy,
    AuthenticationService,
    UserSearchRepository,
    UserOnboardingRepository,
    UserOnboardingService
  ],
  exports: [SequelizeModule, UserManagementService],
})
export class UserManagementModule {}
