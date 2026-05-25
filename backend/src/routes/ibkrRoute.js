import express from "express";
import { confirmStatus, getMarketData, getPositions, getStatus, marketCahceData, placeTestOrder, searchStockSummary } from "../controllers/ibkrController.js";

const router = express.Router();

router.get("/auth-status", confirmStatus);
router.get("/status", getStatus);
router.get("/positions", getPositions);

router.get("/search-stock/:symbol", searchStockSummary);
router.get("/market-data", getMarketData);

// Cache data
router.get("/market-summary", marketCahceData);

router.post("/test-buy", placeTestOrder);

export default router;