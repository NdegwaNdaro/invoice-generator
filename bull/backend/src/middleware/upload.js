import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";

const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../uploads");

const storage = multer.diskStorage({
  destination: directory,
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `logo-${Date.now()}${extension}`);
  }
});

export const uploadLogo = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    callback(null, ["image/png", "image/jpeg", "image/webp"].includes(file.mimetype));
  }
});
