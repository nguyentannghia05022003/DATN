// src/app-users/schemas/app-user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class AppUser extends Document {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop()
    name: string; // Add the name field

    @Prop()
    age: number;

    @Prop()
    address: string;

    @Prop()
    phone: string;
}

export const AppUserSchema = SchemaFactory.createForClass(AppUser);