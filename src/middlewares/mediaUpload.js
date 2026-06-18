import multer from "multer";
import path from "path";

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"));
    }
};

const mediaUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 *1024 , // 10mb per file
        files: 5 // max 10 files at once
    },
    fileFilter
})

export default mediaUpload;