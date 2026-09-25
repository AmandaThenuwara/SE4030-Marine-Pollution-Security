const path = require("path");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = require("./src/config/db");
const taskRoutes = require("./src/routes/taskRoutes");
const volunteerRoutes = require("./src/routes/volunteerRoutes");
const authRoutes = require("./src/routes/auth.routes");
const achievementRoutes = require("./src/routes/achievement.routes");
const extrasRoutes = require("./src/routes/extras.routes");
const chReportRoutes = require("./src/routes/chReport.routes");
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');

const helmet = require("helmet");

const app = express();
const server = http.createServer(app);

// Security Headers (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:", "http:", "https:"],
        connectSrc: ["'self'", "ws:", "wss:", "http:", "https:"],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    xFrameOptions: { action: "deny" },
    noSniff: true,
  })
);

// Middleware
const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:5174", "http://localhost:3000"].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const isVercel = origin.endsWith('.vercel.app');
    const isAllowed = allowedOrigins.includes(origin);
    
    if (isAllowed || isVercel || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'), false);
    }
  },
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"]
  }
});

// Expose io to request object
app.set("io", io);


app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

const { sanitizeInputs } = require("./src/middleware/sanitize.middleware");
app.use(sanitizeInputs);

// Serve uploaded files with security headers (Prevent MIME-sniffing and SVG XSS)
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, filePath) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      const ext = path.extname(filePath).toLowerCase();
      if (['.html', '.htm', '.svg', '.xml', '.pdf'].includes(ext)) {
        res.setHeader('Content-Disposition', 'attachment');
      }
    },
  })
);

// Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/tasks", taskRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/extras", extrasRoutes);
app.use("/api/ch/reports", chReportRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Pollution Management Hub API is running with Socket.io 🌊");
});

io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);
  socket.on("disconnect", () => console.log("Client disconnected"));
});

const errorHandler = require("./src/middleware/errorHandler");

// ... after routes ...
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const seederService = require("./src/services/seeder.service");

// Connect DB then seed and start server
if (require.main === module) {
  connectDB()
    .then(async () => {
      await seederService.seedDefaultUsers();
      server.listen(PORT, () =>
        console.log(`Server running on http://localhost:${PORT}`)
      );
    })
    .catch((err) => {
      console.error("DB connection failed:", err.message);
      process.exit(1);
    });
}

module.exports = { app, server };
