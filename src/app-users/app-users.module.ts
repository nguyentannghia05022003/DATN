import { Module } from '@nestjs/common';
import { AppUsersService } from './app-users.service';
import { AppUsersController } from './app-users.controller';

@Module({
  controllers: [AppUsersController],
  providers: [AppUsersService]
})
export class AppUsersModule {}
