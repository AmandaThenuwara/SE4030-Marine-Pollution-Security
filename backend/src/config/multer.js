const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadDir = process.env.UPLOAD_DIR || "uploads";

// Ensure base uploads folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Common helpers
function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

const SAFE_MIME_EXT_MAP = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

function imageFileFilter(req, file, cb) {
  const allowedExts = [".jpg", ".jpeg", ".png", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!allowedExts.includes(ext) || !SAFE_MIME_EXT_MAP[file.mimetype]) {
    return cb(new Error("Only safe image formats (.jpg, .jpeg, .png, .webp) are allowed"));
  }
  cb(null, true);
}

function makeFileName(prefix, original, mimetype) {
  const safeExt = SAFE_MIME_EXT_MAP[mimetype] || ".jpg";
  return `${prefix}_${Date.now()}_${Math.round(Math.random() * 1e9)}${safeExt}`;
}

// -------------------------
// Profile pics uploader
// -------------------------
const profilePicsDir = path.join(uploadDir, "profilePics");
ensureDir(profilePicsDir);

const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, profilePicsDir);
  },
  filename: function (req, file, cb) {
    cb(null, makeFileName("ch", file.originalname, file.mimetype));
  },
});

const uploadProfilePic = multer({
  storage: profileStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});


// Report photos uploader
// -------------------------
const reportPhotosDir = path.join(uploadDir, "reportPhotos");
ensureDir(reportPhotosDir);

const reportPhotoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, reportPhotosDir);
  },
  filename: function (req, file, cb) {
    cb(null, makeFileName("rep", file.originalname, file.mimetype));
  },
});

const uploadReportPhoto = multer({
  storage: reportPhotoStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB for reports
});

module.exports = { uploadProfilePic, uploadReportPhoto };