import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AppUsersService } from './app-users.service';
import { CreateAppUserDto } from './dto/create-app-user.dto';
import { UpdateAppUserDto } from './dto/update-app-user.dto';

@Controller('app-users')
export class AppUsersController {
  constructor(private readonly appUsersService: AppUsersService) {}

  @Post()
  create(@Body() createAppUserDto: CreateAppUserDto) {
    return this.appUsersService.create(createAppUserDto);
  }

  @Get()
  findAll() {
    return this.appUsersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appUsersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAppUserDto: UpdateAppUserDto) {
    return this.appUsersService.update(+id, updateAppUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appUsersService.remove(+id);
  }
}
