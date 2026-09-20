import mongoose from "mongoose";
import dns from "dns";

// Configure reliable DNS servers to prevent querySrv ECONNREFUSED issues on Windows/Node with MongoDB Atlas
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Custom DNS fallback not supported in some sandboxes
}

export const connectDB = async (): Promise<typeof mongoose | null> => {
  const MONGODB_URI =
    process.env.MONGODB_URI ||
    "mongodb+srv://khushbookumari23074_db_user:uy1QyBemAKoSzk70@cluster0.hu4jmnw.mongodb.net/multiserviceapp?retryWrites=true&w=majority";

  try {
    console.log("📡 Connecting to MongoDB Atlas Database...");
    const conn = await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 50,
      minPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    });

    console.log(`\n==================================================`);
    console.log(`✅ Connected to MongoDB Atlas Database`);
    console.log(`📂 DB Host: ${conn.connection.host}`);
    console.log(`📂 DB Name: ${conn.connection.name}`);
    console.log(`⚡ Connection Pool: Ready (Min 10, Max 50)`);
    console.log(`==================================================\n`);

    return conn;
  } catch (error: any) {
    console.error(`\n==================================================`);
    console.error(`❌ MongoDB Atlas Connection Error:`);
    console.error(`⚠️ ${error.message}`);
    console.error(`==================================================\n`);
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
    return null;
  }
};

export default connectDB;
