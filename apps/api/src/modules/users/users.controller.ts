import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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
  create(@Body(new ZodValidationPipe(userCreateSchema)) body: UserCreateInput) {
    return this.usersService.create(body);
  }

  @RequirePermission('users:update')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(userUpdateSchema)) body: UserUpdateInput,
  ) {
    return this.usersService.update(id, body);
  }

  @RequirePermission('users:delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
