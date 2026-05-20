import express from "express";
import { getPositions, getStatus, placeTestOrder } from "../controllers/ibkrController.js";

const router = express.Router();

router.get("/status", getStatus);
router.get("/positions", getPositions);

router.post("/test-buy", placeTestOrder);

export default router;