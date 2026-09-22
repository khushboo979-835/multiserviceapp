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
app.use("/api/auth", authRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/admin", adminRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/ecommerce", ecommerceRouter);


// Initialize MongoDB Atlas connection
connectDB();

// Health-check entry point
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
  console.log(`🚀 Production server executing on port ${PORT}`);
});
