import * as express from 'express';
import { attachmentMiddleware } from './multer/attachment.middleware';

const uploadRouter = express.Router();
uploadRouter.post('/', attachmentMiddleware.single('attachment'), async (req: any, res) => {
  try {
    if (req.file) {
      if (req.file.filename) {
        res.status(200).send(`${req.file.filename}`);
      }
    } else {
      res.status(200).end();
    }
  } catch (error) {
    res.status(error.status || 500).send(error.message || 'Internal Server Error');
  }
});

export const attachmentRouter = uploadRouter;
