const path = require("path");
const ChReport = require("../models/chReport.model");
const { createReportSchema } = require("../validators/report.validators");
const { updateReportSchema } = require("../validators/reportUpdate.validators");
const {
  generatePollutionDescriptionFromReportPhoto,
} = require("../services/reportAi.service");

function normalizeUrl(url, req) {
  if (!url) return url;
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
  // If the URL contains localhost:5000, swap it with the current baseUrl
  return url.replace(/https?:\/\/localhost:5000/g, baseUrl);
}

function buildFileUrl(req, relPath) {
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
  const urlPath = relPath.split(path.sep).join("/");
  return `${baseUrl}/${urlPath}`;
}

// POST /api/ch/reports (multipart/form-data)
async function createReport(req, res) {
  const parsed = createReportSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ success: false, message: parsed.error.issues[0].message });
  }

  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "Report photo is required" });
  }

  const {
    title,
    categories,
    otherCategoryText = "",
    severity,
    lat,
    lng,
    address = "",
  } = parsed.data;

  const hasOther = categories.map((c) => c.toLowerCase()).includes("other");
  if (hasOther && !otherCategoryText.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "Please specify other category text" });
  }

  const relPath = path.join(
    process.env.UPLOAD_DIR || "uploads",
    "reportPhotos",
    req.file.filename
  );
  const photoUrl = buildFileUrl(req, relPath);

  const report = await ChReport.create({
    ownerId: req.user.id,
    title,
    categories,
    otherCategoryText,
    severity,
    location: { lat, lng, address },
    photoUrl,
    aiStatus: "pending",
    aiDescription: "",
    finalDescription: "",
    isPublished: false,
  });

  // Trigger AI generation in the background
  (async () => {
    try {
      const aiText = await generatePollutionDescriptionFromReportPhoto(photoUrl);
      const cleaned = (aiText || "").trim();
      if (cleaned) {
        report.aiDescription = cleaned;
        report.aiStatus = "done";
        if (!report.finalDescription?.trim()) {
          report.finalDescription = cleaned;
        }
        await report.save();
      } else {
        report.aiStatus = "failed";
        await report.save();
      }
    } catch (err) {
      console.error("Delayed AI Generation failed:", err.message);
      report.aiStatus = "failed";
      await report.save();
    }
  })();

  return res.status(201).json({
    success: true,
    message: "Report draft created",
    report,
  });
}

// GET /api/ch/reports (my reports)
async function listMyReports(req, res) {
  const reports = await ChReport.find({ ownerId: req.user.id }).sort({
    createdAt: -1,
  });
  
  // Normalize URLs for the frontend
  const normalized = reports.map(r => {
    const doc = r.toObject();
    doc.photoUrl = normalizeUrl(doc.photoUrl, req);
    return doc;
  });

  return res.status(200).json({ success: true, reports: normalized });
}

// GET /api/ch/reports/:id
async function getMyReport(req, res) {
  const report = await ChReport.findOne({
    _id: req.params.id,
    ownerId: req.user.id,
  });

  if (!report) {
    return res.status(404).json({ success: false, message: "Report not found" });
  }

  const doc = report.toObject();
  doc.photoUrl = normalizeUrl(doc.photoUrl, req);

  return res.status(200).json({ success: true, report: doc });
}

// DELETE /api/ch/reports/:id
async function deleteMyReport(req, res) {
  const report = await ChReport.findOneAndDelete({
    _id: req.params.id,
    ownerId: req.user.id,
  });

  if (!report) {
    return res.status(404).json({ success: false, message: "Report not found" });
  }

  return res.status(200).json({ success: true, message: "Report deleted" });
}

// PATCH /api/ch/reports/:id  (JSON)
async function updateMyReport(req, res) {
  const parsed = updateReportSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ success: false, message: parsed.error.issues[0].message });
  }

  const report = await ChReport.findOne({
    _id: req.params.id,
    ownerId: req.user.id,
  });

  if (!report) {
    return res.status(404).json({ success: false, message: "Report not found" });
  }

  const data = parsed.data;

  if (data.title !== undefined) report.title = data.title;

  if (data.categories !== undefined) {
    report.categories = data.categories;

    // If "Other" is not selected anymore, clear text
    const hasOther = data.categories.map((c) => c.toLowerCase()).includes("other");
    if (!hasOther) report.otherCategoryText = "";
  }

  if (data.otherCategoryText !== undefined) report.otherCategoryText = data.otherCategoryText;

  if (data.severity !== undefined) report.severity = data.severity;

  // Update location only for provided fields
  if (data.lat !== undefined) report.location.lat = data.lat;
  if (data.lng !== undefined) report.location.lng = data.lng;
  if (data.address !== undefined) report.location.address = data.address;

  if (data.finalDescription !== undefined) report.finalDescription = data.finalDescription;

  // If categories include "Other", enforce otherCategoryText
  const hasOther = report.categories.map((c) => c.toLowerCase()).includes("other");
  if (hasOther && !String(report.otherCategoryText || "").trim()) {
    return res
      .status(400)
      .json({ success: false, message: "Please specify other category text" });
  }

  await report.save();

  return res.status(200).json({
    success: true,
    message: "Report updated",
    report,
  });
}

// POST /api/ch/reports/:id/photo (multipart/form-data)
async function updateMyReportPhoto(req, res) {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Report photo is required" });
  }

  const report = await ChReport.findOne({
    _id: req.params.id,
    ownerId: req.user.id,
  });

  if (!report) {
    return res.status(404).json({ success: false, message: "Report not found" });
  }

  const relPath = path.join(
    process.env.UPLOAD_DIR || "uploads",
    "reportPhotos",
    req.file.filename
  );
  report.photoUrl = buildFileUrl(req, relPath);

  // If photo changes, AI is no longer valid
  report.aiStatus = "pending";
  report.aiDescription = "";

  await report.save();

  return res.status(200).json({
    success: true,
    message: "Report photo updated",
    report,
  });
}

// POST /api/ch/reports/:id/publish
async function publishMyReport(req, res) {
  const report = await ChReport.findOne({
    _id: req.params.id,
    ownerId: req.user.id,
  });

  if (!report) {
    return res.status(404).json({ success: false, message: "Report not found" });
  }

  if (!String(report.finalDescription || "").trim()) {
    return res.status(400).json({
      success: false,
      message: "Add a final description before publishing (AI or manual).",
    });
  }

  report.isPublished = true;
  await report.save();

  return res.status(200).json({
    success: true,
    message: "Report published",
    report,
  });
}

// POST /api/ch/reports/:id/unpublish
async function unpublishMyReport(req, res) {
  const report = await ChReport.findOne({
    _id: req.params.id,
    ownerId: req.user.id,
  });

  if (!report) {
    return res.status(404).json({ success: false, message: "Report not found" });
  }

  report.isPublished = false;
  await report.save();

  return res.status(200).json({
    success: true,
    message: "Report unpublished",
    report,
  });
}

// POST /api/ch/reports/:id/ai/generate
async function generateAiForMyReport(req, res) {
  const force = req.body?.force === true || req.body?.force === "true";

  const report = await ChReport.findOne({
    _id: req.params.id,
    ownerId: req.user.id,
  });

  if (!report) {
    return res.status(404).json({ success: false, message: "Report not found" });
  }

  if (report.aiStatus === "done" && !force) {
    return res.status(409).json({
      success: false,
      message:
        "AI description already generated. Send { force: true } to regenerate.",
    });
  }

  try {
    const aiText = await generatePollutionDescriptionFromReportPhoto(report.photoUrl);
    const cleaned = (aiText || "").trim();

    if (!cleaned) {
      report.aiStatus = "failed";
      await report.save();
      return res.status(500).json({
        success: false,
        message: "AI generation failed",
        error: "OpenAI returned empty text",
      });
    }

    report.aiDescription = cleaned;
    report.aiStatus = "done";

    if (!report.finalDescription?.trim() || force) {
      report.finalDescription = cleaned;
    }

    await report.save();

    return res.status(200).json({
      success: true,
      message: "AI description generated",
      report,
    });
  } catch (err) {
    report.aiStatus = "failed";
    await report.save();

    return res.status(500).json({
      success: false,
      message: "AI generation failed",
      error: err.message,
    });
  }
}

// POST /api/ch/reports/:id/ai/skip
async function skipAiForMyReport(req, res) {
  const report = await ChReport.findOne({
    _id: req.params.id,
    ownerId: req.user.id,
  });

  if (!report) {
    return res.status(404).json({ success: false, message: "Report not found" });
  }

  report.aiStatus = "skipped";
  report.aiDescription = "";
  await report.save();

  return res.status(200).json({
    success: true,
    message: "AI skipped",
    report,
  });
}

// GET /api/ch/reports/all/published
async function listAllPublishedReports(req, res) {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 100);
  const skip = (page - 1) * limit;

  // Only return published ones with bounded pagination
  const reports = await ChReport.find({ isPublished: true })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("ownerId", "name email");

  const normalized = reports.map(r => {
    const doc = r.toObject();
    doc.photoUrl = normalizeUrl(doc.photoUrl, req);
    return doc;
  });

  return res.status(200).json({ success: true, reports: normalized });
}

module.exports = {
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
};