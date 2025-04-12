// src/app-users/dto/create-app-user.dto.ts
import { IsEmail, IsNotEmpty, IsString, IsInt, IsOptional, MinLength } from 'class-validator';

export class CreateAppUserDto {
    @IsEmail({}, { message: 'Email không đúng định dạng' })
    @IsNotEmpty({ message: 'Email không được để trống' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'Password không được để trống' })
    password: string;

    @IsString()
    @IsOptional()
    name?: string; // Add the name field

    @IsInt()
    @IsOptional()
    age?: number;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    phone?: string;
}