import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, User } from 'src/apis/user/entities/user.entity';
import { Roles } from 'src/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles || !roles?.length) {
      return true;
    }

    const request = await context.switchToHttp().getRequest();
    const user = request.user as User;
    return this.matchRoles(roles, user.role);
  }

  private matchRoles(roles: Role[], userRole: Role) {
    return roles.some((role) => role?.includes(userRole));
  }
}
