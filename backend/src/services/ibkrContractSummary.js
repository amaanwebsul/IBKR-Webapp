
import { ensureIBKRSession } from "../utils/ensureIbkrSession.js";
import ibkrApi from "./ibkrService.js";

const SNAPSHOT_FIELDS = [
  // --- Core pricing ---
  31,   // last
  84,   // bid
  86,   // ask
  85,   // ask size
  88,   // bid size
  87,   // volume (formatted)
  7762, // volume long (precise)

  // --- Day stats ---
  70,   // high
  71,   // low
  7295, // open
  7296, // close
  7741, // prior close
  82,   // change
  83,   // change %

  // --- Contract / identity ---
  55,   // symbol
  6004, // exchange
  6008, // conid
  6070, // secType
  7219, // description
  7221, // listing exchange
  7051, // company name
  6509, // market data availability (CRITICAL)
  7184, // canBeTraded

  // --- Liquidity / short ---
  7282, // avg volume (90d)
  7636, // shortable shares
  7637, // fee rate
  7644, // shortable

  // --- Volatility ---
  7087, // hist vol 30d
  7283, // option implied vol
  7084, // IV / HV ratio

  // --- Corporate ---
  7671, // dividends fwd
  7672, // dividends TTM
  7686, // upcoming earnings
  7689  // recent earnings
].join(",");

function parseNum(v) {
  if (v == null) return null;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v.replace(/,/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function parseText(v) {
  if (v == null) return null;
  return String(v).trim() || null;
}

function parseBool(v) {
  if (v === 1 || v === "1" || v === true) return true;
  if (v === 0 || v === "0" || v === false) return false;
  return null;
}

function calculatePriceConfidence({
  hasRealtime,
  hasDelayed,
  hasBidAsk,
  spreadPct,
  volume,
  isOTC,
  otcPump,
  snapshotUnreliable,
}) {
  let score = 0;
  const reasons = [];

  if (hasRealtime) score += 40;
  else if (hasDelayed) {
    score += 20;
    reasons.push("delayed_data");
  } else {
    reasons.push("no_market_data");
  }

  if (hasBidAsk) score += 25;
  else reasons.push("no_bid_ask");

  if (spreadPct != null) {
    if (spreadPct <= 0.5) score += 20;
    else if (spreadPct <= 1) score += 15;
    else if (spreadPct <= 3) score += 5;
    else reasons.push("wide_spread");
  } else {
    reasons.push("no_spread");
  }

  if (volume != null && volume > 0) {
    score += Math.min(10, Math.log10(volume + 1) * 2);
  } else {
    reasons.push("no_volume");
  }

  if (isOTC) {
    score -= 20;
    reasons.push("otc");
  }

  if (otcPump) {
    score -= 25;
    reasons.push("otc_pump_risk");
  }

  if (snapshotUnreliable) {
    score -= 15;
    reasons.push("snapshot_unreliable");
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score,
    level:
      score >= 85 ? "high" :
      score >= 60 ? "medium" :
      score >= 40 ? "low" : "very_low",
    reasons,
  };
}


// export const getMarketSnapshotData = (conid) => {
//   try {
//     const response = await ibkrApi.get(
//       `/iserver/marketdata/snapshot?conids=${conid}&fields=${SNAPSHOT_FIELDS}`
//     );
//   } catch (error) {
    
//   }
// }

export async function fetchMarketSnapshot(conid) {
  if (!conid || isNaN(Number(conid))) {
    throw new Error("fetchMarketSnapshot: invalid conid");
  }

  const ok = await ensureIBKRSession();
  if (!ok) throw new Error("IBKR session not authenticated");

  await new Promise((r) => setTimeout(r, 250));

  // const response = await ibkrSafeRequest("/iserver/marketdata/snapshot", {
  //   params: {
  //     conids: String(conid),
  //     fields: SNAPSHOT_FIELDS,
  //   },
  // });

  const response = await ibkrApi.get(
    `/iserver/marketdata/snapshot?conids=${conid}&fields=${SNAPSHOT_FIELDS}`
  );

  const rawResponse =
    Array.isArray(response) ? response[0] :
    typeof response === "object" ? response :
    null;
    
    const raw = rawResponse?.data[0]

  if (!raw) throw new Error("IBKR snapshot empty");

  const mda = raw[6509] ?? null;

  if (!mda) {
    return { conid, raw, noEntitlement: true };
  }

  return {
    conid,
    entitlement: String(mda),
    raw,
    pricing: {
      last: raw[31] ?? null,
      bid: raw[84] ?? null,
      ask: raw[86] ?? null,
      bidSize: raw[88] ?? null,
      askSize: raw[85] ?? null,
      volume: raw[7762] ?? raw[87] ?? null,
    },
    meta: {
      symbol: raw[55] ?? null,
      secType: raw[6070] ?? null,
      exchange: raw[6004] ?? null,
      primaryExchange: raw[7221] ?? null,
    },
    flags: {
      hasRealtime: String(mda).includes("R"),
      hasDelayed: String(mda).includes("D"),
    },
  };
}

export async function buildContractSummaryFromScanner(row) {
  try {
    
    // console.log("inside buildContractSummaryFromScanner");
    
    const conid = Number(row?.con_id ?? row?.conidex ?? row?.conid ?? 0);
    if (!conid) throw new Error("Invalid conid");
  
    const fallbackSymbol = row.symbol ?? null;
    const snap = await fetchMarketSnapshot(conid);
  
    // console.log(snap, "snapshot data fetched");

    const raw = snap.raw;
  
    /* ---------- No entitlement ---------- */
    if (snap.noEntitlement) {
      return {
        identity: {
          symbol: fallbackSymbol,
          conid,
          name: row.company_name || row.contract_description_1 || null,
          secType: row.sec_type || "STK",
          currency: "USD",
          primaryExchange: row.listing_exchange || null,
          marketDataAvailability: null,
        },
        pricing: {
          last: raw[31] ?? null,
          bid: raw[84] ?? null,
          ask: raw[86] ?? null,
          bidSize: raw[88] ?? null,
          askSize: raw[85] ?? null,
          volume: raw[7762] ?? raw[87] ?? null,
        },
        liquidity: { active: false },
        marketQuality: {
          level: "ignore",
          liquidityScore: 0,
          flags: ["no_entitlement"],
        },
        priceConfidence: {
          score: 0,
          level: "none",
          reasons: ["no_market_data_entitlement"],
        },
        risk: { snapshotUnreliable: true },
      };
    }

    // console.log(snap, "snap data");
    
    const flags = snap.flags;
  
    const last = snap.pricing.last;
    const bid = snap.pricing.bid;
    const ask = snap.pricing.ask;
    const volume = snap.pricing.volume;
  
    const hasBidAsk = bid != null || ask != null;
    const hasVolume = volume != null && volume > 0;
    const active = hasBidAsk || hasVolume;
  
    const spreadPct =
      bid != null && ask != null && bid > 0
        ? ((ask - bid) / bid) * 100
        : null;
  
    const isOTC =
      snap.meta?.primaryExchange?.toUpperCase().includes("OTC") ||
      snap.meta?.primaryExchange?.toUpperCase().includes("PINK");
  
    const snapshotUnreliable =
      isOTC ||
      (!flags.hasRealtime && !flags.hasDelayed) ||
      (!hasBidAsk && !hasVolume);
  
    let liquidityScore = 0;
    if (bid != null) liquidityScore += 15;
    if (ask != null) liquidityScore += 15;
    if (hasVolume) liquidityScore += Math.min(30, Math.log10(volume + 1) * 6);
    if (spreadPct != null && spreadPct <= 1) liquidityScore += 25;
    liquidityScore = Math.max(0, Math.min(100, Math.round(liquidityScore)));
  
    return {
      identity: {
        symbol: snap.meta.symbol || fallbackSymbol,
        conid,
        name: parseText(raw[7051]) || row.company_name || null,
        secType: snap.meta.secType,
        currency: "USD",
        primaryExchange: snap.meta.primaryExchange,
        exchange: snap.meta.exchange,
        description: parseText(raw[7219]),
        canBeTraded: parseBool(raw[7184]),
        marketDataAvailability: snap.entitlement,
      },
  
      pricing: {
        last,
        bid,
        ask,
        mid:
          bid != null && ask != null
            ? Number(((bid + ask) / 2).toFixed(6))
            : null,
        best: last ?? bid ?? ask ?? null,
        open: parseNum(raw[7295]),
        high: parseNum(raw[70]),
        low: parseNum(raw[71]),
        close: parseNum(raw[7296]),
        prevClose: parseNum(raw[7741]),
        change: parseNum(raw[82]),
        changePct: parseNum(raw[83]),
      },
  
      liquidity: {
        volume,
        active,
      },
  
      spreadPct,
  
      volatility: {
        hist30d: parseNum(raw[7087]),
        implied: parseNum(raw[7283]),
        ivHvRatio: parseNum(raw[7084]),
      },
  
      events: {
        dividendsFwd: parseNum(raw[7671]),
        dividendsTTM: parseNum(raw[7672]),
        nextEarnings: parseText(raw[7686]),
        lastEarnings: parseText(raw[7689]),
      },
  
      marketQuality: {
        level: liquidityScore >= 70 ? "tradable" :
               liquidityScore >= 30 ? "watch-only" : "ignore",
        liquidityScore,
        flags: [
          ...(isOTC ? ["otc"] : []),
          ...(!hasVolume ? ["no_volume"] : []),
          ...(!hasBidAsk ? ["no_quotes"] : []),
          ...(!flags.hasRealtime && flags.hasDelayed ? ["delayed_data"] : []),
        ],
      },
  
      priceConfidence: calculatePriceConfidence({
        hasRealtime: flags.hasRealtime,
        hasDelayed: flags.hasDelayed,
        hasBidAsk,
        spreadPct,
        volume,
        isOTC,
        otcPump: false,
        snapshotUnreliable,
      }),
  
      risk: {
        otc: isOTC,
        illiquid: liquidityScore < 30,
        snapshotUnreliable,
      },
    };
  } catch (error) {
    console.log(error);
  }
}