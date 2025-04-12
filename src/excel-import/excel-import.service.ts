import { Injectable, BadRequestException } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { ProductsService } from '../products/products.service';
import { CreateProductDto } from '../products/dto/create-product.dto';
import * as fs from 'fs';
import { parse, format } from 'date-fns';
import { parse as csvParse } from 'csv-parse/sync';

@Injectable()
export class ExcelImportService {
    constructor(private readonly productsService: ProductsService) { }

    async importProducts(file: Express.Multer.File, user: any): Promise<any> {
        console.log('File received:', file);
        if (!file) {
            throw new BadRequestException('Vui lòng upload file Excel hoặc CSV');
        }

        let buffer: Buffer;
        if (file.buffer) {
            buffer = file.buffer;
        } else if (file.path) {
            buffer = fs.readFileSync(file.path);
        } else {
            throw new BadRequestException('Không thể đọc dữ liệu tệp. Vui lòng kiểm tra cấu hình upload.');
        }

        const products: CreateProductDto[] = [];

        if (file.mimetype === 'text/csv') {
            const records = csvParse(buffer, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
            });

            for (const [index, record] of records.entries()) {
                const rowNumber = index + 2;

                const manufacturingDateRaw = record.manufacturingDate;
                const expirationDateRaw = record.expirationDate;

                let manufacturingDate: string;
                let expirationDate: string;

                try {
                    if (manufacturingDateRaw) {
                        const parsedManufacturingDate = parse(manufacturingDateRaw, 'MM/dd/yyyy', new Date());
                        manufacturingDate = format(parsedManufacturingDate, 'yyyy-MM-dd');
                    }
                    if (expirationDateRaw) {
                        const parsedExpirationDate = parse(expirationDateRaw, 'MM/dd/yyyy', new Date());
                        expirationDate = format(parsedExpirationDate, 'yyyy-MM-dd');
                    }
                } catch (error) {
                    throw new BadRequestException(`Dữ liệu ngày tháng không hợp lệ tại dòng ${rowNumber}`);
                }

                const productData: CreateProductDto = {
                    barCode: record.barCode?.toString(),
                    name: record.name?.toString(),
                    description: record.description?.toString() || undefined,
                    image: record.image?.toString() || undefined,
                    price: Number(record.price),
                    sold: Number(record.sold) || 0,
                    quantity: Number(record.quantity),
                    manufacturingDate,
                    expirationDate,
                };

                if (!productData.barCode || !productData.name || !productData.price || !productData.quantity) {
                    throw new BadRequestException(`Dữ liệu không hợp lệ tại dòng ${rowNumber}`);
                }

                products.push(productData);
            }
        } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            const workbook = new ExcelJS.Workbook();
            try {
                await workbook.xlsx.load(buffer);
            } catch (error) {
                throw new BadRequestException(`Lỗi khi đọc tệp Excel: ${error.message}`);
            }

            const worksheet = workbook.getWorksheet(1);
            if (!worksheet) {
                throw new BadRequestException('File Excel không có dữ liệu');
            }

            worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                if (rowNumber === 1) return;

                const manufacturingDateRaw = row.getCell(8).value?.toString();
                const expirationDateRaw = row.getCell(9).value?.toString();

                let manufacturingDate: string;
                let expirationDate: string;

                try {
                    if (manufacturingDateRaw) {
                        const parsedManufacturingDate = parse(manufacturingDateRaw, 'MM/dd/yyyy', new Date());
                        manufacturingDate = format(parsedManufacturingDate, 'yyyy-MM-dd');
                    }
                    if (expirationDateRaw) {
                        const parsedExpirationDate = parse(expirationDateRaw, 'MM/dd/yyyy', new Date());
                        expirationDate = format(parsedExpirationDate, 'yyyy-MM-dd');
                    }
                } catch (error) {
                    throw new BadRequestException(`Dữ liệu ngày tháng không hợp lệ tại dòng ${rowNumber}`);
                }

                const productData: CreateProductDto = {
                    barCode: row.getCell(1).value?.toString(),
                    name: row.getCell(2).value?.toString(),
                    description: row.getCell(3).value?.toString() || undefined,
                    image: row.getCell(4).value?.toString() || undefined,
                    price: Number(row.getCell(5).value),
                    sold: Number(row.getCell(6).value) || 0,
                    quantity: Number(row.getCell(7).value),
                    manufacturingDate,
                    expirationDate,
                };

                if (!productData.barCode || !productData.name || !productData.price || !productData.quantity) {
                    throw new BadRequestException(`Dữ liệu không hợp lệ tại dòng ${rowNumber}`);
                }

                products.push(productData);
            });
        } else {
            throw new BadRequestException('Chỉ hỗ trợ tệp Excel (.xlsx) hoặc CSV (.csv)');
        }

        if (products.length === 0) {
            throw new BadRequestException('Không có dữ liệu để import');
        }

        const savedProducts = [];
        for (const product of products) {
            const savedProduct = await this.productsService.create(product, user);
            savedProducts.push(savedProduct);
        }

        if (file.path) {
            fs.unlinkSync(file.path);
        }

        return savedProducts;
    }
}