const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth } = require("../middlewares/auth");
const { getMe, updateMe, uploadMyProfilePic } = require("../controllers/chUser.controller");
const { uploadProfilePic } = require("../config/multer");

const router = express.Router();

/**
 * @openapi
 * /api/ch/users/me:
 *   get:
 *     summary: Get current logged-in user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: OK }
 *       401: { description: Unauthorized }
 */
router.get("/me", requireAuth, asyncHandler(getMe));

/**
 * @openapi
 * /api/ch/users/me:
 *   patch:
 *     summary: Update current user profile fields
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: "New Name" }
 *               phone: { type: string, example: "0711111111" }
 *               role: { type: string, enum: [general, volunteer], example: "general" }
 *               bio: { type: string, example: "Updated bio" }
 *     responses:
 *       200: { description: Updated }
 *       400: { description: Validation error }
 *       401: { description: Unauthorized }
 */
router.patch("/me", requireAuth, asyncHandler(updateMe));

/**
 * @openapi
 * /api/ch/users/me/profile-pic:
 *   post:
 *     summary: Upload profile picture (local storage)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [profilePic]
 *             properties:
 *               profilePic:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200: { description: Profile picture updated }
 *       400: { description: No file / invalid file }
 *       401: { description: Unauthorized }
 */
router.post(
  "/me/profile-pic",
  requireAuth,
  uploadProfilePic.single("profilePic"),
  asyncHandler(uploadMyProfilePic)
);

module.exports = router;