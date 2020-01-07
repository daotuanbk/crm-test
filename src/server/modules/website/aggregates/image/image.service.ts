import { imageRepository } from '@app/website';
import * as fs from 'fs';
import { logger } from '@app/core';

export const imageService: any = {
  find: async (_params: any) => {
    // 1. authorize

    // 2. validate

    // 3. do business logic

    // 4. persist to db
    return await imageRepository.find();
  },
  get: async (_id: string, _params: any) => {
    // 1. authorize

    // 2. validate

    // 3. do business logic

    // 4. persist to db
    return await imageRepository.findById(_id);
  },
  create: async (data: Partial<any>, _params: any) => {
    // 1. authorize

    // 2. validate

    // 3. do business logic

    // 4. persist to db
    return await imageRepository.create(data);
  },
  patch: async (_id: string, data: any, _params: any): Promise<void> => {
    // 1. authorize

    // 2. validate

    // 3. do business logic

    // 4. persist to db
    await imageRepository.update(data);
  },
  deleteByUrl : async (url: any): Promise<void> => {
    if (url) {
      return await imageRepository.deleteByUrl(url);
    }
  },
  moveFilesToUploadFolder : async (url: any): Promise<void> => {
    const path = process.cwd();
    const lastDot = url.lastIndexOf('.');
    const fileHash = url.slice(0, lastDot).trim();
    const mainPromise = new Promise((resolve, _reject) => {
      move(`${path}/temp/${url}`, `${path}/upload/${url}` , (err?: any) => {
        if (err) {
          _reject(err.message);
          logger.error(err);
        }
        resolve();
      });
    });
    const resizePromise = new Promise((resolve, _reject) => {
      move(`${path}/temp/${fileHash}-resize.jpg`, `${path}/upload/${fileHash}-resize.jpg` , (err?: any) => {
        if (err) {
          _reject(err.message);
          logger.error(err);
        }
        resolve();
      });
    });

    return await Promise.all([mainPromise, resizePromise]) as any;
  },
};

const move = (oldPath: any, newPath: any, callback: any) => {
  fs.rename(oldPath, newPath, (err: any) => {
    if (err) {
      logger.error(err);
      if (err.code === 'EXDEV') {
        copy();
      } else callback();
    }
    callback();
  });

  const copy = () => {
    const readStream = fs.createReadStream(oldPath);
    const writeStream = fs.createWriteStream(newPath);

    readStream.on('error', callback);
    writeStream.on('error', callback);

    readStream.on('close', () => {
        fs.unlink(oldPath, callback);
    });

    readStream.pipe(writeStream);
  };
};
