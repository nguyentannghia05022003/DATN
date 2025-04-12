import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateUserDto extends OmitType(CreateUserDto, ['password', 'email'] as const) {
    @IsNotEmpty({ message: '_id không được để trống' })
    _id: string;

    @IsNotEmpty({ message: 'fullName không được để trống' })
    fullName: string;

    @IsNotEmpty({ message: 'phone không được để trống' })
    phone: string;

    @IsOptional()
    @IsNotEmpty({ message: 'avatar không được để trống' })
    avatar: string;
}
