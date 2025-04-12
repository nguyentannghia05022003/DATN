import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppUsersService } from './app-users.service';
import { AppUsersController } from './app-users.controller';
import { AppUser, AppUserSchema } from './schemas/app-user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AppUser.name, schema: AppUserSchema }]),
  ],
  controllers: [AppUsersController],
  providers: [AppUsersService],
})
export class AppUsersModule { }