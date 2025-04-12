import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { Response } from 'express';
import { IUser } from 'src/users/dto/users.interface';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByUsername(email);
        if (user && this.usersService.isValidPassword(pass, user.password)) {
            const { password, ...result } = user.toObject();
            return result;
        }
        return null;
    }

    async login(user: any, response: Response) {
        const { _id, fullName, email, role, phone, avatar } = user;
        const payload = { _id, fullName, email, role, phone, avatar };

        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')) / 1000,
        });

        await this.usersService.updateUserToken(refreshToken, _id);

        response.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
        });

        return {
            access_token: accessToken,
            user: { _id, fullName, email, role, phone, avatar },
        };
    }

    async register(registerUserDto: RegisterUserDto) {
        const newUser = await this.usersService.register(registerUserDto);
        return {
            _id: newUser._id,
            createdAt: newUser.createdAt,
        };
    }

    async processNewToken(refreshToken: string, response: Response) {
        try {
            this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
            });

            const user = await this.usersService.findUserByToken(refreshToken);
            if (user) {
                const { _id, fullName, email, role, phone, avatar } = user;
                const payload = { _id, fullName, email, role, phone, avatar };

                const accessToken = this.jwtService.sign(payload);
                const newRefreshToken = this.jwtService.sign(payload, {
                    secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
                    expiresIn: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')) / 1000,
                });

                await this.usersService.updateUserToken(newRefreshToken, _id.toString());

                response.cookie('refresh_token', newRefreshToken, {
                    httpOnly: true,
                    maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
                });

                return {
                    access_token: accessToken,
                    user: { _id, fullName, email, role, phone, avatar },
                };
            } else {
                throw new BadRequestException('Refresh token không hợp lệ. Vui lòng đăng nhập lại.');
            }
        } catch (error) {
            throw new BadRequestException('Refresh token không hợp lệ. Vui lòng đăng nhập lại.');
        }
    }

    async logout(response: Response, user: IUser) {
        await this.usersService.updateUserToken('', user._id);
        response.clearCookie('refresh_token');
        return { message: 'Đăng xuất thành công' };
    }

    async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
        const user = await this.usersService.findOneById(userId);
        if (!user) {
            throw new BadRequestException('Không tìm thấy người dùng');
        }

        const isValid = this.usersService.isValidPassword(changePasswordDto.oldPassword, user.password);
        if (!isValid) {
            throw new BadRequestException('Mật khẩu cũ không đúng');
        }

        await this.usersService.updateUserPassword(userId, changePasswordDto.newPassword);
    }

    async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
        const user = await this.usersService.findOneByEmail(forgotPasswordDto.email);
        if (!user) {
            throw new BadRequestException('Email không tồn tại');
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // Hết hạn sau 10 phút
        await this.usersService.saveOtp(user._id.toString(), otp, otpExpiry);

        console.log(`OTP của bạn là: ${otp}`); // Tạm thời in ra console
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const user = await this.usersService.findUserByOtp(resetPasswordDto.otp);
        if (!user) {
            throw new BadRequestException('OTP không hợp lệ');
        }

        const now = new Date();
        if (now > user.otpExpiry) {
            throw new BadRequestException('OTP đã hết hạn');
        }

        await this.usersService.updateUserPassword(user._id.toString(), resetPasswordDto.newPassword);
        await this.usersService.clearOtp(user._id.toString());
    }
}