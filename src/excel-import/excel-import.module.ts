import { Module } from '@nestjs/common';
import { ExcelImportService } from './excel-import.service';
import { ExcelImportController } from './excel-import.controller';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ProductsModule],
  controllers: [ExcelImportController],
  providers: [ExcelImportService],
})
export class ExcelImportModule { }