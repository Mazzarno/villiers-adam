import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/auth.types';
import { UserCreateInput, userCreateSchema, UserUpdateInput, userUpdateSchema } from './dto/users.schemas';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @RequirePermission('users:read')
  @Get()
  list() {
    return this.usersService.list();
  }

  @RequirePermission('users:read')
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.usersService.getById(id);
  }

  @RequirePermission('users:create')
  @Post()
  create(@Req() req: Request, @Body(new ZodValidationPipe(userCreateSchema)) body: UserCreateInput) {
    const actor = req.user as JwtPayload;
    return this.usersService.create(body, actor);
  }

  @RequirePermission('users:update')
  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(userUpdateSchema)) body: UserUpdateInput,
  ) {
    const actor = req.user as JwtPayload;
    return this.usersService.update(id, body, actor);
  }

  @RequirePermission('users:delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
