// src/app-users/dto/login-app-user.dto.ts
import { IsString, IsEmail } from 'class-validator';

export class LoginAppUserDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}