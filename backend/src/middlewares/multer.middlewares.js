import multer from 'multer';
import fs from 'fs';

const uploadsDir = './uploads/';

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const uploadSingle = multer({ storage: storage, limits: { fileSize: 100 * 1024 * 1024 } }).single('file');
export const uploadMany = multer({ storage: storage, limits: { fileSize: 100 * 1024 * 1024 } }).array('files',10);

