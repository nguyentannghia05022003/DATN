// src/app-users/dto/update-app-user.dto.ts
import { IsString, IsEmail, IsInt, IsOptional } from 'class-validator';

export class UpdateAppUserDto {
    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    name?: string;

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