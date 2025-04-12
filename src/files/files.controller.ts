import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { Public } from 'src/decorator/customize';
import { ProductsService } from 'src/products/products.service';
import { UsersService } from 'src/users/users.service';
import { FilesService } from './files.service';

@Controller('file')
export class FilesController {
  constructor(
    private readonly fileService: FilesService,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
  ) { }

  @Post('/upload')
  @Public()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    const uploadType = req.headers['upload-type'];

    if (uploadType === 'avatar' || uploadType === 'product') {
      return {
        fileUploaded: file.filename,
      };
    }

    throw new BadRequestException(
      'Upload failed, cần update Request Header với upload-type',
    );
  }
}