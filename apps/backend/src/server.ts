import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import { initTrackingSocket } from "./sockets/tracking.socket";
import paymentRouter from "./routes/payment.routes";
import authRouter from "./routes/auth.routes";
import adminRouter from "./routes/admin.routes";
import bookingRouter from "./routes/booking.routes";
import categoryRouter from "./routes/category.routes";
import ecommerceRouter from "./routes/ecommerce.routes";
import bannerRouter from "./routes/banner.routes";
import mediaRouter from "./routes/media.routes";

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    credentials: true,
  })
);

app.options("*", cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));


// Mount API routes
app.use("/api/auth", authRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/admin", adminRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/ecommerce", ecommerceRouter);
app.use("/api/products", ecommerceRouter);
app.use("/api/banners", bannerRouter);
app.use("/api/media", mediaRouter);


// Initialize MongoDB Atlas connection
connectDB();

import path from "path";
import fs from "fs";

// Static files and APK hosting
const publicDir = path.join(__dirname, "../public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
app.use(express.static(publicDir));

// Direct APK Download Endpoint
const handleApkDownload = (req: express.Request, res: express.Response) => {
  const apkPath = path.join(publicDir, "inisha-city-service.apk");
  if (fs.existsSync(apkPath)) {
    res.download(apkPath, "inisha-city-service.apk");
  } else {
    res.redirect("https://expo.dev/artifacts/eas/BjY8NeANKOl5HWWMIny1GuG2r_Hx1jqSQ8jAdwZhf0Q.apk");
  }
};

app.get("/download", handleApkDownload);
app.get("/api/download", handleApkDownload);
app.get("/download-apk", handleApkDownload);
app.get("/inisha.apk", handleApkDownload);

// User-friendly landing page with 1-Click Download button
app.get("/app", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Download Inisha City Service App</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        body { background: #0f172a; color: #fff; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .card { background: #1e293b; border: 1px solid #334155; border-radius: 24px; padding: 32px 24px; max-width: 420px; width: 100%; text-align: center; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
        .logo-box { width: 80px; height: 80px; background: linear-gradient(135deg, #ef4444, #b91c1c); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 36px; box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.4); }
        h1 { font-size: 24px; font-weight: 800; margin-bottom: 8px; color: #f8fafc; }
        p { color: #94a3b8; font-size: 14px; margin-bottom: 24px; line-height: 1.5; }
        .btn { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; background: #16a34a; color: #fff; text-decoration: none; padding: 18px 24px; border-radius: 16px; font-size: 17px; font-weight: 700; box-shadow: 0 10px 20px rgba(22, 163, 74, 0.4); }
        .badge { display: inline-block; background: #334155; color: #38bdf8; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; margin-bottom: 16px; }
        .info { margin-top: 24px; font-size: 12px; color: #64748b; border-top: 1px solid #334155; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo-box">🛠️</div>
        <div class="badge">Official Android Release v1.0.0</div>
        <h1>Inisha City Service</h1>
        <p>Your Need, Our Service. On-demand doorstep repairs, salon & home services.</p>
        <a href="/download" class="btn">
          <span>📲 Download APK (84 MB)</span>
        </a>
        <div class="info">
          100% Virus-Free & Verified Direct Android Package (.apk)
        </div>
      </div>
    </body>
    </html>
  `);
});

// Root & API Health Status Handlers
const apiStatusHandler = (req: express.Request, res: express.Response) => {
  res.status(200).json({
    success: true,
    status: "ONLINE",
    message: "Inisha City Service Backend Engine is active and running smoothly 🚀",
    database: "MongoDB Atlas Connected",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/health",
      apiHealth: "/api/health",
      admin: "/api/admin",
      auth: "/api/auth",
      bookings: "/api/bookings",
      categories: "/api/categories",
      payment: "/api/payment",
      ecommerce: "/api/ecommerce",
    },
  });
};

app.get("/", apiStatusHandler);
app.get("/api", apiStatusHandler);
app.get("/health", apiStatusHandler);
app.get("/api/health", apiStatusHandler);

// Configure Socket.io server wrapping the http server instance
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

app.set("io", io);

// Initialize socket listeners
initTrackingSocket(io);

// Server execution port
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Production server executing on port ${PORT}`);
});
