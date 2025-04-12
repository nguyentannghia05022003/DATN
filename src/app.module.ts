import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { softDeletePlugin } from 'soft-delete-plugin-mongoose';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { AppUsersModule } from './app-users/app-users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabasesModule } from './databases/databases.module';
import { ExcelImportModule } from './excel-import/excel-import.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { BankingModule } from './banking/banking.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 2,
    }),
    MulterModule.register({
      storage: memoryStorage(),
    }), // Thêm MulterModule toàn cục
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL'),
        connectionFactory: (connection) => {
          connection.plugin(softDeletePlugin);
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    ProductsModule,
    AuthModule,
    FilesModule,
    RolesModule,
    PermissionsModule,
    AppUsersModule,
    DatabasesModule,
    ExcelImportModule,
    BankingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }