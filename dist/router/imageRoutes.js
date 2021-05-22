"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageRoutes = void 0;
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
exports.imageRoutes = router;
const multerDiskStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, "downloads");
    },
    filename: (_req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `${file.originalname}-${Date.now()}.${ext}`);
    },
});
const multerFilter = (_req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
};
const upload = multer_1.default({ storage: multerDiskStorage, fileFilter: multerFilter });
const uploadPicture = upload.single("image");
router.post("/upload", uploadPicture, (req, res) => {
    res.status(200).json({ message: "file downloaded successfully" });
});
