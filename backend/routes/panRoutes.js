import express from "express";
import { verifyPan } from "../controllers/panController.js";
import {initiatePanVerification, advancePanVerification} from "../controllers/cashfreepan.js"

const router = express.Router();

router.post("/verify-pan", verifyPan)
router.post("/advance", advancePanVerification); 

export default router;

