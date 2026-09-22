const express = require("express");
const cors = require("cors");
const path = require("path");
const swaggerUi = require("swagger-ui-express");

const apiRoutes = require("./routes");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");
const { swaggerSpec } = require("./config/swagger");

const app = express();

// Middleware
app.use(cors()); // keep open for now
app.use(express.json());

// Serve uploaded files
const uploadDir = process.env.UPLOAD_DIR || "uploads";
app.use("/uploads", express.static(path.join(process.cwd(), uploadDir)));

// Swagger docs
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Root test route
app.get("/", (req, res) => {
  res.status(200).send("Backend is running 🚀");
});

// API routes prefix
app.use("/api", apiRoutes);

// 404 + error handler
app.use(notFound);
app.use(errorHandler);

module.exports = app;