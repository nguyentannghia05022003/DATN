// src/app-users/app-users.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode } from '@nestjs/common';
import { AppUsersService } from './app-users.service';
import { CreateAppUserDto } from './dto/create-app-user.dto';
import { UpdateAppUserDto } from './dto/update-app-user.dto';
import { LoginAppUserDto } from './dto/login-app-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto'; // Import the new DTO
import { AppUser } from './schemas/app-user.schema';
import { Public } from 'src/decorator/customize';

@Controller('app-users')
export class AppUsersController {
  constructor(private readonly appUsersService: AppUsersService) { }

  @Public()
  @Post('register')
  async register(@Body() createAppUserDto: CreateAppUserDto): Promise<AppUser> {
    return this.appUsersService.register(createAppUserDto);
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(@Body() loginAppUserDto: LoginAppUserDto): Promise<AppUser> {
    return this.appUsersService.login(loginAppUserDto);
  }

  @Public()
  @Get()
  async findAll(): Promise<AppUser[]> {
    return this.appUsersService.findAll();
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<AppUser | string> {
    return this.appUsersService.findOne(id);
  }

  @Public()
  @Post()
  async create(@Body() createAppUserDto: CreateAppUserDto): Promise<AppUser> {
    return this.appUsersService.create(createAppUserDto);
  }

  @Public()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAppUserDto: UpdateAppUserDto,
  ): Promise<AppUser> {
    return this.appUsersService.update(id, updateAppUserDto);
  }

  @Public()
  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<{ deletedCount: number }> {
    return this.appUsersService.delete(id);
  }

  @Public()
  // New endpoint for changing password
  @Post('change-password/:id')
  @HttpCode(200)
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<AppUser> {
    return this.appUsersService.changePassword(id, changePasswordDto);
  }
}