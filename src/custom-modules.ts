import { AuthenticationModule } from './authentication/authentication.module';
import { UserManagementModule } from './user-management/user-management.module';
import { HealthTrackingModule } from './health-tracking/health-tracking.module';

export const customModules = [
  AuthenticationModule,
  UserManagementModule,
  HealthTrackingModule
];
