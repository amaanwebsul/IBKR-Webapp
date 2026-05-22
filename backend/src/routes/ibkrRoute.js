import express from "express";
import { confirmStatus, getMarketData, getPositions, getStatus, placeTestOrder } from "../controllers/ibkrController.js";

const router = express.Router();

router.get("/auth-status", confirmStatus);
router.get("/status", getStatus);
router.get("/positions", getPositions);

router.get("/market-data", getMarketData);

router.post("/test-buy", placeTestOrder);

export default router;