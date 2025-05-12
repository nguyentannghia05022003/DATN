import { IsNotEmpty, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class ProductScanItem {
    @IsNotEmpty({ message: 'barCode không được để trống' })
    barCode: string;
}

export class ScanProductDto {
    @IsOptional()
    @IsArray({ message: 'products phải là một mảng' })
    @ValidateNested({ each: true })
    @Type(() => ProductScanItem)
    products?: ProductScanItem[];
}