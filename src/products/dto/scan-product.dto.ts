import { IsNotEmpty, IsNumber, Min, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class ProductScanItem {
    @IsNotEmpty({ message: 'barCode không được để trống' })
    barCode: string;

    @IsNotEmpty({ message: 'quantityPurchased không được để trống' })
    @IsNumber({}, { message: 'quantityPurchased phải có định dạng là số' })
    @Min(1, { message: 'quantityPurchased phải lớn hơn hoặc bằng 1' })
    quantityPurchased: number;
}

export class ScanProductDto {
    @IsOptional()
    @IsArray({ message: 'products phải là một mảng' })
    @ValidateNested({ each: true })
    @Type(() => ProductScanItem)
    products?: ProductScanItem[];
}