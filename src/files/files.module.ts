import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigService } from './multer.config';
import { UsersModule } from 'src/users/users.module';
import { ProductsModule } from 'src/products/products.module';

@Module({
  controllers: [FilesController],
  providers: [FilesService, MulterConfigService],
  imports: [
    UsersModule,
    ProductsModule,
    MulterModule.registerAsync({
      useClass: MulterConfigService,
    })
  ]
})
export class FilesModule { }
