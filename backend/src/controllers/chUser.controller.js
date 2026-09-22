const path = require("path");
const { updateProfileSchema } = require("../validators/profile.validators");

function buildFileUrl(req, relPath) {
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
  // Ensure forward slashes for URLs (Windows fix)
  const urlPath = relPath.split(path.sep).join("/");
  return `${baseUrl}/${urlPath}`;
}

async function getMe(req, res) {
  const u = req.user;

  return res.status(200).json({
    success: true,
    user: {
      id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      bio: u.bio,
      profilePicUrl: u.profilePicUrl,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    },
  });
}

async function updateMe(req, res) {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0].message,
    });
  }

  const u = req.user;
  const { name, phone, role, bio } = parsed.data;

  if (name !== undefined) u.name = name;
  if (phone !== undefined) u.phone = phone;
  if (role !== undefined) u.role = role;
  if (bio !== undefined) u.bio = bio;

  await u.save();

  return res.status(200).json({
    success: true,
    message: "Profile updated",
    user: {
      id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      bio: u.bio,
      profilePicUrl: u.profilePicUrl,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    },
  });
}

async function uploadMyProfilePic(req, res) {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const u = req.user;

  // relative path like: uploads/profilePics/filename.jpg
  const relPath = path.join(process.env.UPLOAD_DIR || "uploads", "profilePics", req.file.filename);
  const fullUrl = buildFileUrl(req, relPath);

  u.profilePicUrl = fullUrl;
  await u.save();

  return res.status(200).json({
    success: true,
    message: "Profile picture updated",
    profilePicUrl: u.profilePicUrl,
  });
}

module.exports = { getMe, updateMe, uploadMyProfilePic };