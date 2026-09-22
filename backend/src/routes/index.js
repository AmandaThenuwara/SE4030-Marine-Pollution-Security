const express = require("express");
const healthRoutes = require("./health.routes");
const authRoutes = require("./auth.routes");
const chUserRoutes = require("./chUser.routes");
const chReportRoutes = require("./chReport.routes");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/ch/users", chUserRoutes);
router.use("/ch/reports", chReportRoutes);

module.exports = router;