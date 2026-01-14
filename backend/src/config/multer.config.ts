import * as fs from 'fs';
import { extname, join } from 'path';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';

// Allow overriding upload dir for production (e.g. mounted volume)
const uploadsRoot = process.env.UPLOADS_DIR || join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsRoot)) {
  fs.mkdirSync(uploadsRoot, { recursive: true });
}

export const multerConfig = {
  storage: diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsRoot),
    filename: (req, file, cb) => {
      const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
};
