import * as express from 'express';
import sharp from 'sharp';
import { imageService } from '@app/website';
import { imageMiddleware } from './multer/image.middleware';

const uploadRouter = express.Router();
uploadRouter.post('/', imageMiddleware.single('image'), async (req: any, res) => {
  try {
    if (req.file) {
      if (req.file.filename) {
        const path = process.cwd();
        const lastDot = req.file.filename.lastIndexOf('.');
        const fileHash = req.file.filename.slice(0, lastDot).trim();

        await imageService.create({
          name: req.file.filename,
          url: req.file.filename,
        });

        // Resize
        await sharp(`${path}/temp/${req.file.filename}`).resize(800).toFormat('jpg').toFile(`${path}/temp/${fileHash}-resize.jpg`);
        res.status(200).send(`${req.file.filename}`);
      }
    } else {
      res.status(200).end();
    }
  } catch (error) {
    res.status(error.status || 500).send(error.message || 'Internal Server Error');
  }
});

export const imageRouter = uploadRouter;
