import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // TODO: Refer link https://github.com/nestjsx/nest-access-control for refactor
    const roles = this.reflector.get<string[]>('roles', context.getHandler()); // The role group information obtained from the controller annotation.
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // const hasRole = () => user.roles.some((role) => roles.includes(role)); // Whether to match the role
    const hasRole = () => roles.includes(user.role); // Whether to match the role
    return user && user.role && hasRole();
  }
}
