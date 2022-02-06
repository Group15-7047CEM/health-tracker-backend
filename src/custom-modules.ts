import { AuthenticationModule } from './authentication/authentication.module';
import { UserManagementModule } from './user-management/user-management.module';

export const customModules = [
  AuthenticationModule,
  UserManagementModule,
];
