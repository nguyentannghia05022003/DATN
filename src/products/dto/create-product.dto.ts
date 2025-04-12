import { IsNotEmpty, IsNumber, Min, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateProductDto {
    @IsNotEmpty({ message: 'barCode không được để trống' })
    barCode: string;

    @IsNotEmpty({ message: 'name không được để trống' })
    name: string;

    @IsOptional()
    @IsString({ message: 'description phải là chuỗi ký tự' })
    description?: string;

    @IsOptional()
    @IsString({ message: 'image phải đúng định dạng' })
    image: string;

    @IsNotEmpty({ message: 'price không được để trống' })
    @IsNumber({}, { message: 'price phải có định dạng là số' })
    @Min(0, { message: 'price phải lớn hơn hoặc bằng 0' })
    price: number;

    @IsOptional()
    @IsNumber({}, { message: 'sold phải có định dạng là số' })
    @Min(0, { message: 'sold phải lớn hơn hoặc bằng 0' })
    sold: number;

    @IsNotEmpty({ message: 'quantity không được để trống' })
    @IsNumber({}, { message: 'quantity phải có định dạng là số' })
    @Min(0, { message: 'quantity phải lớn hơn hoặc bằng 0' })
    quantity: number;

    @IsNotEmpty({ message: 'manufacturingDate không được để trống' })
    @IsDateString({ message: 'manufacturingDate phải là chuỗi ngày hợp lệ (ví dụ: 2024-12-25)' })
    manufacturingDate: string;

    @IsNotEmpty({ message: 'expirationDate không được để trống' })
    @IsDateString({ message: 'expirationDate phải là chuỗi ngày hợp lệ (ví dụ: 2024-12-25)' })
    expirationDate: string;
}