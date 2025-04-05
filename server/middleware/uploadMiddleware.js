import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure image storage engine. In production, you might use S3 or another cloud storage.
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/images"));
  },
  filename: (req, file, cb) => {
    // Prepend timestamp to filename for uniqueness
    cb(null, Date.now() + "-" + file.originalname);
  },
});

//configure video storage
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/videos"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

//file filter to allow only images
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed.!"));
  }
};

//file filter for videos
const videoFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("video/")) {
    cb(null, true);
  }
};

//create and export multer middleware for image upload
export const imageUpload = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
});

//create and export multer middleware for video upload
export const videoUpload = multer({
  storage: videoStorage,
  fileFilter: videoFileFilter,
});

//When hosting in the cloud, consider replacing the local storage engine with a cloud storage solution (e.g., using multer-s3 for AWS S3) to store files in the cloud.
