import { Controller, Get, Post, UseGuards, Body, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { Request, Response } from 'express';
import { IUser } from 'src/users/dto/users.interface';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
    ) { }

    @Public()
    @UseGuards(LocalAuthGuard)
    @Post('/login')
    @ResponseMessage('Đăng nhập người dùng')
    handleLogin(@Req() req, @Res({ passthrough: true }) response: Response) {
        return this.authService.login(req.user, response);
    }

    @Public()
    @ResponseMessage('Đăng ký người dùng mới')
    @Post('/register')
    handleRegister(@Body() registerUserDto: RegisterUserDto) {
        return this.authService.register(registerUserDto);
    }

    @ResponseMessage('Lấy thông tin tài khoản')
    @Get('/account')
    async handleGetAccount(@User() user: IUser) {
        return { user };
    }

    @Public()
    @ResponseMessage('Lấy thông tin người dùng bằng Refresh Token')
    @Get('/refresh')
    handleRefreshToken(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        const refreshToken = request.cookies['refresh_token'];
        return this.authService.processNewToken(refreshToken, response);
    }

    @ResponseMessage('Đăng xuất người dùng')
    @Post('/logout')
    handleLogout(@User() user: IUser, @Res({ passthrough: true }) response: Response) {
        return this.authService.logout(response, user);
    }

    @ResponseMessage('Thay đổi mật khẩu thành công')
    @UseGuards(JwtAuthGuard)
    @Post('/change-password')
    async handleChangePassword(
        @User() user: IUser,
        @Body() changePasswordDto: ChangePasswordDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        await this.authService.changePassword(user._id, changePasswordDto);
        await this.authService.logout(response, user);
        return { message: 'Đổi mật khẩu thành công, vui lòng đăng nhập lại' };
    }

    @Public()
    @ResponseMessage('Gửi yêu cầu quên mật khẩu thành công')
    @Post('/forgot-password')
    async handleForgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        await this.authService.forgotPassword(forgotPasswordDto);
        return { message: 'Mã OTP đã được gửi đến email của bạn' };
    }

    @Public()
    @ResponseMessage('Đặt lại mật khẩu thành công')
    @Post('/reset-password')
    async handleResetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        await this.authService.resetPassword(resetPasswordDto);
        return { message: 'Đặt lại mật khẩu thành công, vui lòng đăng nhập' };
    }
}