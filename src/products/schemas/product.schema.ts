import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({
    timestamps: true
})
export class Product {
    @Prop()
    barCode: string;

    @Prop()
    name: string;

    @Prop()
    description: string;

    @Prop()
    image: string;

    @Prop()
    price: number;

    @Prop({ default: 0 })
    sold: number;

    @Prop()
    quantity: number;

    @Prop()
    manufacturingDate: Date;

    @Prop()
    expirationDate: Date;

    @Prop({ type: Object })
    createdBy: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    };

    @Prop({ type: Object })
    updatedBy: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    };

    @Prop({ type: Object })
    deleteBy: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    };

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;

    @Prop()
    isDelete: boolean;

    @Prop()
    deleteAt: Date;

}

export const ProductSchema = SchemaFactory.createForClass(Product);