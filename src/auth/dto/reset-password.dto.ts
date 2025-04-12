import { IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
    @IsNotEmpty({ message: 'OTP không được để trống' })
    otp: string;

    @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
    //@MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
    newPassword: string;
}