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

function imageFileFilter(req, file, cb) {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only jpg, png, webp images are allowed"));
  }
  cb(null, true);
}

function makeFileName(prefix, original) {
  const ext = path.extname(original).toLowerCase();
  const safeExt = ext || ".jpg";
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
    cb(null, makeFileName("ch", file.originalname));
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
    cb(null, makeFileName("rep", file.originalname));
  },
});

const uploadReportPhoto = multer({
  storage: reportPhotoStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB for reports
});

module.exports = { uploadProfilePic, uploadReportPhoto };