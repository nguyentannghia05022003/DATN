import { Controller, Post, UploadedFile, UseInterceptors, Req, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExcelImportService } from './excel-import.service';
import { AuthGuard } from '@nestjs/passport';
import { ResponseMessage } from '../decorator/customize';

@Controller('excel-import')
export class ExcelImportController {
    constructor(private readonly excelImportService: ExcelImportService) { }

    @Post('products')
    @UseInterceptors(FileInterceptor('file'))
    @ResponseMessage('Import Products from Excel Success')
    async importProducts(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
        return this.excelImportService.importProducts(file, req.user);
    }
}