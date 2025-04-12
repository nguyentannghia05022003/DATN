import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from './dto/users.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @ResponseMessage("Create a new user")
  @Post()
  create(
    @Body() createUserDto: CreateUserDto,
    @User() user: IUser
  ) {
    return this.usersService.create(createUserDto, user);
  }

  @Public()
  @ResponseMessage("Fetch user by id")
  @Get(':id')
  findOne(
    @Param('id') id: string
  ) {
    return this.usersService.findOne(id);
  }

  @ResponseMessage("Fetch User with paginate")
  @Public()
  @Get()
  findAll(
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string,
  ) {
    return this.usersService.findAll(+currentPage, +limit, qs);
  }

  @ResponseMessage("Update user success")
  @Patch()
  update(
    @Body() updateUserDto: UpdateUserDto,
    @User() user: IUser
  ) {
    return this.usersService.update(updateUserDto, user);
  }

  // @Patch('avatar')
  // updateAvatar(@Body() body: { id: string; avatar: string }) {
  //   return this.usersService.updateAvatar(body.id, body.avatar);
  // }

  @ResponseMessage("Delete user success")
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @User() user: IUser
  ) {
    return this.usersService.remove(id, user);
  }
}
