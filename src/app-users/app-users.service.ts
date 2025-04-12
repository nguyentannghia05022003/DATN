import { Injectable } from '@nestjs/common';
import { CreateAppUserDto } from './dto/create-app-user.dto';
import { UpdateAppUserDto } from './dto/update-app-user.dto';

@Injectable()
export class AppUsersService {
  create(createAppUserDto: CreateAppUserDto) {
    return 'This action adds a new appUser';
  }

  findAll() {
    return `This action returns all appUsers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} appUser`;
  }

  update(id: number, updateAppUserDto: UpdateAppUserDto) {
    return `This action updates a #${id} appUser`;
  }

  remove(id: number) {
    return `This action removes a #${id} appUser`;
  }
}
