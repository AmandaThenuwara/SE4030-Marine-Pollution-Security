const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { authenticate } = require("../middleware/auth.middleware");
const { uploadReportPhoto } = require("../config/multer");
const {
  createReport,
  listMyReports,
  getMyReport,
  deleteMyReport,
  updateMyReport,
  updateMyReportPhoto,
  publishMyReport,
  unpublishMyReport,
  generateAiForMyReport,
  skipAiForMyReport,
  listAllPublishedReports,
} = require("../controllers/chReport.controller");

const router = express.Router();

/**
 * @openapi
 * /api/ch/reports:
 *   post:
 *     summary: Create a report draft (requires photo + location + title + categories + severity)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [photo, title, categories, severity, lat, lng]
 *             properties:
 *               photo: { type: string, format: binary }
 *               title: { type: string, example: "Pollution near beach" }
 *               categories:
 *                 type: array
 *                 items: { type: string }
 *                 example: ["Plastic","Glass"]
 *               otherCategoryText: { type: string, example: "Fishing net" }
 *               severity: { type: string, enum: [low, medium, high], example: "low" }
 *               lat: { type: number, example: 6.9754 }
 *               lng: { type: number, example: 79.9156 }
 *               address: { type: string, example: "Mount Lavinia Beach" }
 *     responses:
 *       201: { description: Draft created }
 *       400: { description: Validation error }
 *       401: { description: Unauthorized }
 */
router.post("/", authenticate, uploadReportPhoto.single("photo"), asyncHandler(createReport));

/**
 * @openapi
 * /api/ch/reports:
 *   get:
 *     summary: List my reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: OK }
 *       401: { description: Unauthorized }
 */
router.get("/", authenticate, asyncHandler(listMyReports));
router.get("/all/published", authenticate, asyncHandler(listAllPublishedReports));

/**
 * @openapi
 * /api/ch/reports/{id}/ai/generate:
 *   post:
 *     summary: Generate AI description for report photo
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               force: { type: boolean, example: false }
 *     responses:
 *       200: { description: AI generated }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 *       409: { description: Already generated }
 */
router.post("/:id/ai/generate", authenticate, asyncHandler(generateAiForMyReport));

/**
 * @openapi
 * /api/ch/reports/{id}/ai/skip:
 *   post:
 *     summary: Skip AI for this report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: AI skipped }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 */
router.post("/:id/ai/skip", authenticate, asyncHandler(skipAiForMyReport));

/**
 * @openapi
 * /api/ch/reports/{id}/publish:
 *   post:
 *     summary: Publish report (requires finalDescription non-empty)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Published }
 *       400: { description: Missing finalDescription }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 */
router.post("/:id/publish", authenticate, asyncHandler(publishMyReport));

/**
 * @openapi
 * /api/ch/reports/{id}/unpublish:
 *   post:
 *     summary: Unpublish report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Unpublished }
 */
router.post("/:id/unpublish", authenticate, asyncHandler(unpublishMyReport));

/**
 * @openapi
 * /api/ch/reports/{id}:
 *   patch:
 *     summary: Update report fields (JSON)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               categories:
 *                 type: array
 *                 items: { type: string }
 *               otherCategoryText: { type: string }
 *               severity: { type: string, enum: [low, medium, high] }
 *               lat: { type: number }
 *               lng: { type: number }
 *               address: { type: string }
 *               finalDescription: { type: string }
 *     responses:
 *       200: { description: Updated }
 */
router.patch("/:id", authenticate, asyncHandler(updateMyReport));

/**
 * @openapi
 * /api/ch/reports/{id}/photo:
 *   post:
 *     summary: Replace report photo (resets AI status to pending)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [photo]
 *             properties:
 *               photo: { type: string, format: binary }
 *     responses:
 *       200: { description: Photo updated }
 */
router.post("/:id/photo", authenticate, uploadReportPhoto.single("photo"), asyncHandler(updateMyReportPhoto));

/**
 * @openapi
 * /api/ch/reports/{id}:
 *   get:
 *     summary: Get single report (owner)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 */
router.get("/:id", authenticate, asyncHandler(getMyReport));

/**
 * @openapi
 * /api/ch/reports/{id}:
 *   delete:
 *     summary: Delete report (owner)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 *       404: { description: Not found }
 */
router.delete("/:id", authenticate, asyncHandler(deleteMyReport));

module.exports = router;