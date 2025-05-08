import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/dto/users.interface';
import { ScanProductDto } from './dto/scan-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  @ResponseMessage("Create Product Success")
  create(
    @Body() createProductDto: CreateProductDto,
    @User() user: IUser
  ) {
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  //@Public()
  @ResponseMessage("Fetch List Company with paginate")
  findAll(
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string,
  ) {
    return this.productsService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage("Fetch Product by id")
  //@Public()
  findOne(
    @Param('id') id: string
  ) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage("Update Product Success")
  update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateProductDto,
    @User() user: IUser
  ) {
    return this.productsService.update(id, updateCompanyDto, user);
  }

  @Delete(':id')
  @ResponseMessage("Delete Product Success")
  remove(
    @Param('id') id: string,
    @User() user: IUser
  ) {
    return this.productsService.remove(id, user);
  }

  @Post('scan')
  @Public()
  @ResponseMessage("Scan Products Success")
  scan(
    @Body() scanProductDto: ScanProductDto
  ) {
    return this.productsService.scan(scanProductDto);
  }

  @Post('finish-scan')
  @Public()
  @ResponseMessage("Finish Scan and Calculate Total")
  finishScan() {
    return this.productsService.finishScan();
  }

  @Post('cancel-scan')
  @Public()
  @ResponseMessage("Cancel Scan Success")
  cancelScan() {
    return this.productsService.cancelScan();
  }
}
