// src/app-users/app-users.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppUser } from './schemas/app-user.schema';
import { CreateAppUserDto } from './dto/create-app-user.dto';
import { UpdateAppUserDto } from './dto/update-app-user.dto';
import { LoginAppUserDto } from './dto/login-app-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto'; // Import the new DTO
import { genSaltSync, hashSync, compareSync } from 'bcryptjs';

@Injectable()
export class AppUsersService {
  constructor(@InjectModel(AppUser.name) private appUserModel: Model<AppUser>) { }

  private getHashPassword = (password: string): string => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  };

  private isValidPassword = (password: string, hash: string): boolean => {
    return compareSync(password, hash);
  };

  async register(createAppUserDto: CreateAppUserDto): Promise<AppUser> {
    const existingUser = await this.appUserModel.findOne({ email: createAppUserDto.email }).exec();
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = this.getHashPassword(createAppUserDto.password);
    const userToCreate = { ...createAppUserDto, password: hashedPassword };

    const createdUser = new this.appUserModel(userToCreate);
    return createdUser.save();
  }

  async login(loginAppUserDto: LoginAppUserDto): Promise<AppUser> {
    const user = await this.appUserModel.findOne({ email: loginAppUserDto.email }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!this.isValidPassword(loginAppUserDto.password, user.password)) {
      throw new BadRequestException('Invalid password');
    }

    return user;
  }

  async findAll(): Promise<AppUser[]> {
    return this.appUserModel.find().exec();
  }

  async findOne(id: string): Promise<AppUser | string> {
    if (!this.isValidObjectId(id)) {
      return 'Not found user';
    }

    const user = await this.appUserModel.findById(id).exec();
    if (!user) {
      return 'Not found user';
    }
    return user;
  }

  async findOneByEmail(email: string): Promise<AppUser | null> {
    return this.appUserModel.findOne({ email }).exec();
  }

  async create(createAppUserDto: CreateAppUserDto): Promise<AppUser> {
    const hashedPassword = this.getHashPassword(createAppUserDto.password);
    const userToCreate = { ...createAppUserDto, password: hashedPassword };

    const createdUser = new this.appUserModel(userToCreate);
    return createdUser.save();
  }

  async update(id: string, updateAppUserDto: UpdateAppUserDto): Promise<AppUser> {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const existingUser = await this.appUserModel.findById(id).exec();
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (updateAppUserDto.email) {
      const emailExists = await this.appUserModel
        .findOne({ email: updateAppUserDto.email })
        .exec();
      if (emailExists && emailExists._id.toString() !== id) {
        throw new BadRequestException('Email already exists');
      }
    }

    return this.appUserModel
      .findByIdAndUpdate(id, updateAppUserDto, { new: true })
      .exec();
  }

  async delete(id: string): Promise<{ deletedCount: number }> {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const result = await this.appUserModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('User not found');
    }
    return result;
  }

  // New method to change password
  async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<AppUser> {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.appUserModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify the old password
    if (!this.isValidPassword(changePasswordDto.oldPassword, user.password)) {
      throw new BadRequestException('Mật khẩu cũ không đúng');
    }

    // Hash the new password
    const hashedNewPassword = this.getHashPassword(changePasswordDto.newPassword);

    // Update the user's password
    return this.appUserModel
      .findByIdAndUpdate(id, { password: hashedNewPassword }, { new: true })
      .exec();
  }

  private isValidObjectId(id: string): boolean {
    return require('mongoose').Types.ObjectId.isValid(id);
  }
}