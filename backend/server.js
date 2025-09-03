import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import changePasswordRoutes from "./routes/changePasswordRoutes.js";
import authRoutes from "./routes/auth.js";
import businessRoutes from "./routes/business.js";
import connectDB from './db/db.js';
import "./jobs/profileUpdateJob.js"; 
import healthRoutes from "./routes/health.js"

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// Enable CORS
const corsOptions = {
  origin: "https://seaneb-panel.vercel.app", // frontend URL
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

// Connect to MongoDB
connectDB(); // This handles the connection and logs DB name

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/changepassword", changePasswordRoutes);
app.use("/api/health", healthRoutes);

// Server Listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
