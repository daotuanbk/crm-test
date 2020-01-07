import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';
import moment from 'moment';

const storage = multer.diskStorage({
  destination: async (_req: any, _file: any, cb: any) => {
    const fileFolder = path.join(__dirname, `../../../../../../../temp/attachment`);
    const fsAccessPromise = util.promisify(fs.access);
    try {
      await fsAccessPromise(fileFolder);
    } catch (error) {
      const fsMkdirPromise = util.promisify(fs.mkdir);
      await fsMkdirPromise(fileFolder);
    }
    cb(null, path.join(__dirname, `../../../../../../../temp/attachment`));
  },
  filename: async (_req: any, file: any, cb: any) => {
    // const hash = uuid.v4();
    const time = moment().valueOf();
    const lastDot = file.originalname.lastIndexOf('.');
    const fileType = file.originalname.slice(lastDot + 1).trim();
    cb(null, `${file.originalname.slice(0, lastDot)}.${time}.${fileType}`);
  },
});

export const attachmentMiddleware = multer({
  storage,
});
