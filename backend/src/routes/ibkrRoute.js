import express from "express";
import { confirmStatus, getCachedIBKRMarkets, getIBKRMarketSnapshot, getMarketData, getPositions, getStatus, marketSummmaryData, placeTestOrder, searchStockSummary } from "../controllers/ibkrController.js";

const router = express.Router();

router.get("/auth-status", confirmStatus);
router.get("/status", getStatus);
router.get("/positions", getPositions);

router.get("/search-stock/:symbol", searchStockSummary);
router.get("/market-data", getMarketData);


router.get("/market-snapshot/:conid", getIBKRMarketSnapshot);

// Cache data
router.get("/market-summary", marketSummmaryData);
router.get("/cached-market-summary", getCachedIBKRMarkets);


router.post("/test-buy", placeTestOrder);

export default router;