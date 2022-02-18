import { Module, HttpModule } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { HealthTrackingController } from './health-tracking.controller';
import { HealthTrackingService } from './health-tracking.service';
import { UserHealthMetricModel } from './models';

import { AuthenticationModule } from '../authentication/authentication.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      UserHealthMetricModel,
    ]),
    HttpModule,
    AuthenticationModule
  ],
  controllers: [HealthTrackingController],
  providers: [HealthTrackingService],
  exports: [SequelizeModule, HealthTrackingService],
})
export class HealthTrackingModule {}
