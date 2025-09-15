const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// Routes
router.get("/payment", paymentController.createPayment);
router.post("/verify", paymentController.verifyPayment);

module.exports = router;
