// src/cron/ibkrFetchDataCron.js
import cron from "node-cron";
import fs from "fs/promises";
import path from "path";
import pLimit from "p-limit";
import { ensureIBKRSession } from "../utils/ensureIbkrSession.js";
import ibkrApi from "../services/ibkrService.js";
import { buildContractSummaryFromScanner } from "../services/ibkrContractSummary.js";

const enrichLimit = pLimit(4);
const CACHE_FILE = path.resolve("runtime", "ibkr_data.json");

let isRunning = false;
let cronJob = null;

/* =========================================================
   Automation To Fetch IBKR Data
========================================================= */

export async function fetchAndCacheIBKRData(req = null, res = null) {
  // HARD GUARD
  const ibkrEnabled = process.env.IBRK_ENABLED || false;

  if (!ibkrEnabled || ibkrEnabled !== 'true') {

    console.log("🚫 IBKR disabled → skipping fetch cron");

    const payload = { skipped: true, reason: "ibkr_disabled" };

    return res
      ? res.status(200).json({ success: true, payload })
      : { success: true, payload };
  }

  if (isRunning) {
    const payload = { message: "IBKR cron already running", skipped: true };
    return res
      ? res.status(200).json({ success: true, payload })
      : { success: true, payload };
  }

  isRunning = true;

  try {
    console.log("🚀 IBKR Cron started");

    const ok = await ensureIBKRSession();
    if (!ok) throw new Error("IBKR not authenticated");

    const payload = {
      instrument: "STK",
      location: "STK.US",
      type: "MOST_ACTIVE",
      filter: [],
      numberOfRows: 100,
    };

    const data = await ibkrApi.post("/iserver/scanner/run", {
      ...payload
    });

    // console.log(data?.data?.contracts, "data from scanner/run");
    

    const rows = Array.isArray(data?.data?.contracts) ? data?.data?.contracts : [];

    // console.log(rows, "rows log");
    

    if (!rows.length) {
      console.warn("⚠️ IBKR scanner returned empty result — cache preserved");
      const result = { skipped: true, reason: "empty_scanner_result" };
      return res
        ? res.status(200).json({ success: true, payload: result })
        : { success: true, payload: result };
    }

    const markets = await Promise.all(
      rows.map((row) =>
        enrichLimit(async () => {
          try {
            const summary = await buildContractSummaryFromScanner(row);
            return summary ? { ...row, summary } : null;
          } catch {
            return null;
          }
        })
      )
    );

    // console.log(markets, "markets log");
    

    const validMarkets = markets.filter(Boolean);

    if (!validMarkets.length) {
      console.warn("⚠️ IBKR enrichment failed — cache preserved");
      const result = { skipped: true, reason: "enrichment_failed" };
      return res
        ? res.status(200).json({ success: true, payload: result })
        : { success: true, payload: result };
    }

    await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });

    const cachePayload = {
      updatedAt: new Date().toISOString(),
      count: validMarkets.length,
      markets: validMarkets,
    };

    await fs.writeFile(
      CACHE_FILE,
      JSON.stringify(cachePayload, null, 2)
    );

    console.log(`✅ IBKR cache updated (${validMarkets.length} records)`);

    return res
      ? res.status(200).json({ success: true, payload: cachePayload })
      : { success: true, payload: cachePayload };

  } catch (err) {
    console.error("❌ IBKR Cron failed:", err);

    if (res) {
      return res.status(500).json({
        success: false,
        error: err.message || "IBKR cron failed",
      });
    }

    throw err;
  } finally {
    isRunning = false;
  }
}

/* =========================================================
   CRON CONTROL
========================================================= */

export function startIBKRFetchCron() {
  if (cronJob) {
    console.log("⚠️ IBKR Fetch cron already running");
    return;
  }

  // ====================== Every Day Midnight 12 AM (Timezone: UTC) ======================
  // cronJob = cron.schedule(
  //   "0 0 */12 * * *",
  //   () => {
  //     fetchAndCacheIBKRData();
  //   },
  //   {
  //     timezone: "UTC",
  //   }
  // );

  // ========================= Every hour (Timezone: UTC) =================================
  cronJob = cron.schedule(
    "0 0 * * * *",      // Trigger every hour
    // "0 2 * * * *",      // Test Trigger
    () => {
      fetchAndCacheIBKRData();
    },
    {
      timezone: "UTC",
    }
  );

  // console.log("🕒 IBKR market cron scheduled (every 12 hours)");
  console.log("🕒 IBKR market cron scheduled (every hour)");
}

export function stopIBKRFetchCron() {
  if (!cronJob) {
    console.log("⚠️ IBKR Fetch cron not running");
    return;
  }

  cronJob.stop();
  cronJob = null;

  console.log("🛑 IBKR market cron stopped");
}