import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { validateFileType } from "../utils/fileProcessor.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

export const upload = multer({
  storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only one file at a time
  },
  fileFilter: (req, file, cb) => {
    if (validateFileType(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only .txt, .docx, .xlsx, .pptx, .pdf, and .csv files are allowed"), false);
    }
  },
});

// Error handling middleware for multer
export function handleUploadError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Only one file allowed.' });
    }
  }
  
  if (err.message.includes('Only')) {
    return res.status(400).json({ error: err.message });
  }
  
  next(err);
}