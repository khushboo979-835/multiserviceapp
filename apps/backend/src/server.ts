// Force Node.js to use Google public DNS servers to resolve MongoDB SRV records.
// This resolves the common 'querySrv ECONNREFUSED' error on local ISP networks.
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { initTrackingSocket } from "./sockets/tracking.socket";
import paymentRouter from "./routes/payment.routes";

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure Cross-Origin Resource Sharing
const getCorsOrigins = () => {
  const envOrigin = process.env.CORS_ORIGIN;
  if (!envOrigin || envOrigin === "*") return "*";
  return envOrigin.split(",").map((o) => o.trim());
};

app.use(
  cors({
    origin: getCorsOrigins(),
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// Mount API routes
app.use("/api/payment", paymentRouter);

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/multi-service-app";
console.log("Attempting connection to MongoDB database...");

mongoose
  .connect(MONGODB_URI)
  .then((conn) => {
    console.log(`\n==================================================`);
    console.log(`🚀 DATABASE STATUS: Connected Successfully!`);
    console.log(`📂 DB Host: ${conn.connection.host}`);
    console.log(`📂 DB Name: ${conn.connection.name}`);
    console.log(`==================================================\n`);
  })
  .catch((error) => {
    console.error(`\n==================================================`);
    console.error(`🚨 DATABASE ERROR: Connection Failure!`);
    console.error(`❌ Details: ${error.message}`);
    console.error(`==================================================\n`);
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  });

// Health-check entry points
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date() });
});

// Configure Socket.io server wrapping the http server instance
const io = new Server(server, {
  cors: {
    origin: getCorsOrigins(),
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Initialize socket listeners
initTrackingSocket(io);

// Server execution port
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Production-ready server executing on http://localhost:${PORT}`);
});
