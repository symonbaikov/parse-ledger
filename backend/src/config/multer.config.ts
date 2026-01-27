import * as fs from 'fs';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { resolveUploadsDir } from '../common/utils/uploads.util';

// Allow overriding upload dir for production (e.g. mounted volume)
const uploadsRoot = resolveUploadsDir();

export const multerConfig = {
  storage: diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsRoot),
    filename: (_req, file, cb) => {
      const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
};
