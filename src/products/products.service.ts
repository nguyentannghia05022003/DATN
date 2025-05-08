import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ScanProductDto } from './dto/scan-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/dto/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class ProductsService {
  // Cập nhật cấu trúc scannedProducts để bao gồm tên sản phẩm
  private scannedProducts: { barCode: string; name: string; quantityPurchased: number }[] = [];

  constructor(@InjectModel(Product.name) private productModel: SoftDeleteModel<ProductDocument>) { }

  create(createProductDto: CreateProductDto, user: IUser) {
    return this.productModel.create({
      ...createProductDto,
      createdBy: {
        _id: user?._id || 'unknown_id',
        email: user?.email || 'unknown_email'
      }
    });
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.productModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.productModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems
      },
      result
    }
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException(`Không tìm thấy sản phẩm với id=${id}`);

    return await this.productModel.findById(id);
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: IUser) {
    return await this.productModel.updateOne({ _id: id }, {
      ...updateProductDto,
      updatedBy: {
        _id: user?._id || 'unknown_id',
        email: user?.email || 'unknown_email'
      }
    });
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException(`Không tìm thấy sản phẩm với id=${id}`);
    await this.productModel.updateOne(
      { _id: id },
      {
        deleteBy: {
          _id: user?._id || 'unknown_id',
          email: user?.email || 'unknown_email'
        }
      });
    return this.productModel.softDelete({
      _id: id
    });
  }

  async scan(scanProductDto: ScanProductDto) {
    const { products } = scanProductDto;

    if (!products || products.length === 0) {
      throw new BadRequestException('Phải cung cấp mảng products không rỗng');
    }

    // Xử lý từng sản phẩm trong yêu cầu quét
    for (const newProduct of products) {
      // Kiểm tra xem sản phẩm có tồn tại trong cơ sở dữ liệu không
      const product = await this.productModel.findOne({ barCode: newProduct.barCode, isDeleted: false });

      if (!product) {
        throw new BadRequestException(`Không tìm thấy sản phẩm với mã barcode=${newProduct.barCode}`);
      }

      // Kiểm tra xem barCode đã tồn tại trong scannedProducts chưa
      const existingProduct = this.scannedProducts.find(p => p.barCode === newProduct.barCode);
      if (existingProduct) {
        existingProduct.quantityPurchased += newProduct.quantityPurchased;
      } else {
        // Thêm sản phẩm với tên vào mảng scannedProducts
        this.scannedProducts.push({
          barCode: newProduct.barCode,
          name: product.name, // Thêm tên sản phẩm
          quantityPurchased: newProduct.quantityPurchased,
        });
      }
    }

    return {
      message: 'Sản phẩm đã được quét và lưu tạm thời',
      scannedProducts: this.scannedProducts,
    };
  }

  async finishScan() {
    if (this.scannedProducts.length === 0) {
      throw new BadRequestException('Không có sản phẩm nào được quét');
    }

    const session = await this.productModel.db.startSession();
    session.startTransaction();

    try {
      const results = [];
      let totalPrice = 0;

      for (const { barCode, quantityPurchased } of this.scannedProducts) {
        console.log("Đang tìm kiếm mã barcode:", barCode);
        const product = await this.productModel.findOne({ barCode, isDeleted: false }).session(session);
        console.log("Sản phẩm tìm thấy:", product);

        if (!product) {
          throw new BadRequestException(`Không tìm thấy sản phẩm với mã barcode=${barCode}`);
        }

        if (product.quantity < quantityPurchased) {
          throw new BadRequestException(`Số lượng tồn kho không đủ cho sản phẩm ${product.name}. Còn lại: ${product.quantity}`);
        }

        const productTotalPrice = product.price * quantityPurchased;
        totalPrice += productTotalPrice;

        await this.productModel.updateOne(
          { _id: product._id },
          {
            $inc: {
              quantity: -quantityPurchased,
              sold: quantityPurchased
            }
          },
          { session }
        );

        const updatedProduct = await this.productModel.findById(product._id).session(session);
        results.push({
          product: updatedProduct,
          quantityPurchased,
          productTotalPrice
        });
      }

      // Xóa danh sách tạm sau khi hoàn tất
      this.scannedProducts = [];

      await session.commitTransaction();
      session.endSession();

      return {
        products: results,
        totalPrice,
        isFinished: true
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  cancelScan() {
    if (this.scannedProducts.length === 0) {
      throw new BadRequestException('Không có sản phẩm nào để hủy');
    }

    // Lưu danh sách đã hủy (tùy chọn, để debug hoặc log)
    const canceledProducts = [...this.scannedProducts];
    this.scannedProducts = [];

    return {
      message: 'Quá trình quét đã được hủy',
      canceledProducts: canceledProducts
    };
  }
}