import express, { Request, Response } from "express";
import multer from "multer";

const router = express.Router();

const multerDiskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "downloads");
  },
  filename: (_req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `${file.originalname}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage: multerDiskStorage, fileFilter: multerFilter });

const uploadPicture = upload.single("image");

router.post("/upload", uploadPicture, (req: Request, res: Response) => {
  res.status(200).json({ message: "file downloaded successfully" });
});

export { router as imageRoutes };
