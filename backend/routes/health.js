import express from "express";
const router = express.Router();

// Health check route
router.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is healthy",
    timestamp: new Date(),
  });
});

export default router;
