import { Reflector } from '@nestjs/core';
import { Role } from 'src/apis/user/entities/user.entity';

export const Roles = Reflector.createDecorator<Role[]>();
