import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument, User as UserM } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './dto/users.interface';
import aqp from 'api-query-params';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserM.name)
    private userModel: SoftDeleteModel<UserDocument>,
  ) { }

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  };

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  async create(createUserDto: CreateUserDto, user: IUser) {
    const { fullName, email, password, phone } = createUserDto;

    const isExist = await this.userModel.findOne({ email });
    if (isExist) {
      throw new BadRequestException(`Email: ${email} đã tồn tại trên hệ thống. Vui lòng sử dụng email khác.`);
    }

    const hashPassword = this.getHashPassword(password);

    const newUser = await this.userModel.create({
      fullName,
      email,
      password: hashPassword,
      phone,
      role: 'USER', // Gán mặc định là 'USER'
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt,
    };
  }

  async register(user: RegisterUserDto) {
    const { fullName, email, password, phone } = user;

    const isExist = await this.userModel.findOne({ email });
    if (isExist) {
      throw new BadRequestException(`Email: ${email} đã tồn tại trên hệ thống. Vui lòng sử dụng email khác.`);
    }

    const hashPassword = this.getHashPassword(password);
    const newRegister = await this.userModel.create({
      fullName,
      email,
      password: hashPassword,
      phone,
      role: 'USER', // Gán mặc định là 'USER'
    });
    return newRegister;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    const offset = (+currentPage - 1) * (+limit);
    const defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select('-password')
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException(`Không tìm thấy người dùng`);

    return await this.userModel
      .findOne({ _id: id })
      .select('-password');
  }

  findOneByUsername(username: string) {
    return this.userModel.findOne({ email: username });
  }

  async findOneById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException(`Không tìm thấy người dùng`);

    return await this.userModel.findOne({ _id: id });
  }

  async update(updateUserDto: UpdateUserDto, user: IUser) {
    const updated = await this.userModel.updateOne(
      { _id: updateUserDto._id },
      {
        ...updateUserDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return updated;
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException(`Không tìm thấy người dùng`);

    const foundUser = await this.userModel.findById(id);
    if (foundUser && foundUser.email === 'admin@gmail.com') {
      throw new BadRequestException(`Không thể xóa tài khoản admin`);
    }

    await this.userModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return this.userModel.softDelete({ _id: id });
  }

  async updateAvatar(id: string, avatar: string) {
    return this.userModel.updateOne({ _id: id }, {
      avatar,
      updatedAt: new Date(),
    });
  }

  updateUserToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne({ _id }, { refreshToken });
  };

  findUserByToken = async (refreshToken: string) => {
    return await this.userModel.findOne({ refreshToken });
  };

  async findOneByEmail(email: string): Promise<UserDocument> {
    return await this.userModel.findOne({ email });
  }

  async saveOtp(_id: string, otp: string, otpExpiry: Date): Promise<void> {
    await this.userModel.updateOne({ _id }, { otp, otpExpiry });
  }

  async findUserByOtp(otp: string): Promise<UserDocument> {
    return await this.userModel.findOne({ otp });
  }

  async clearOtp(userId: string): Promise<void> {
    await this.userModel.updateOne({ _id: userId }, { otp: null, otpExpiry: null });
  }

  async updateUserPassword(id: string, newPassword: string): Promise<void> {
    const hashPassword = this.getHashPassword(newPassword);
    await this.userModel.updateOne({ _id: id }, { password: hashPassword });
  }
}