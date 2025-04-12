import { Injectable } from '@nestjs/common';
import { MulterModuleOptions, MulterOptionsFactory } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
    ensureExists(targetDirectory: string) {
        fs.mkdirSync(targetDirectory, { recursive: true });
    }

    createMulterOptions(): MulterModuleOptions {
        return {
            storage: diskStorage({
                destination: (req, file, cb) => {
                    let uploadPath = 'public/images';
                    if (req.headers['upload-type'] === 'avatar') {
                        uploadPath += '/avatar';
                    } else if (req.headers['upload-type'] === 'product') {
                        uploadPath += '/product';
                    }
                    this.ensureExists(uploadPath);
                    cb(null, uploadPath);
                },
                filename: (req, file, cb) => {
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16))
                        .join('');
                    const originalName = file.originalname.includes('.')
                        ? file.originalname.split('.')[0]
                        : file.originalname;
                    cb(null, `${originalName}-${randomName}${extname(file.originalname)}`);
                },
            }),
            fileFilter: (req, file, cb) => {
                const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/jpg'];
                if (!req.headers['upload-type']) {
                    cb(new Error('Upload failed, cần update Request Header với upload-type'), false);
                } else if (!allowedTypes.includes(file.mimetype)) {
                    cb(new Error('file extension is not allowed'), false);
                } else {
                    cb(null, true);
                }
            },
        };
    }
}