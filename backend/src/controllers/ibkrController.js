import ibkrApi from "../services/ibkrService.js";
import fs from 'fs';
import path from "path";
import fsPromises from "fs/promises";

const CACHE_FILE = path.resolve("runtime", "ibkr_data.json");

const DEFAULT_MARKET_FIELDS = [
  "31",
  "55",
  "84",
  "86",
];

const MARKET_FIELD_LABELS = {
  "31": "Last price",
  "55": "Symbol",
  "84": "Bid",
  "86": "Ask",
};

const toNumberOrNull = (value) => {
  const amount = Number(value);

  return Number.isFinite(amount)
    ? amount
    : null;
};

const parseCsvParam = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const normalizeMarketSnapshot = (
  row,
  requestedFields
) => {
  const fieldMap = requestedFields.reduce(
    (acc, field) => {
      acc[field] =
        row?.[field] ?? null;
      return acc;
    },
    {}
  );

  return {
    conid:
      row?.conidEx ||
      row?.conid ||
      null,
    symbol:
      row?.["55"] ||
      row?.symbol ||
      null,
    lastPrice:
      toNumberOrNull(row?.["31"]),
    bidPrice:
      toNumberOrNull(row?.["84"]),
    askPrice:
      toNumberOrNull(row?.["86"]),
    updated:
      row?._updated || null,
    rawFields: fieldMap,
  };
};

const getStockSummary = async (symbol) => {
  return await ibkrApi.get(
    `/iserver/secdef/search`,
    {
      params: {
        symbol: symbol,
        name: true,
        secType: "STK",
      },
    }
  );
}

const normalizeStockSummary = (
  item,
  requestedSymbol
) => ({
  requestedSymbol,
  symbol:
    item?.symbol ||
    item?.ticker ||
    requestedSymbol,
  conid:
    item?.conid ||
    item?.conidEx ||
    null,
  companyName:
    item?.companyName ||
    item?.companyHeader ||
    item?.description ||
    null,
  description:
    item?.description || null,
  exchange:
    item?.description || null,
  assetClass:
    item?.secType || null,
});

const resolveSymbolsToConids = async (
  symbols
) => {
  const results = await Promise.all(
    symbols.map(async (symbol) => {
      const response =
        await getStockSummary(symbol);
      const matches = Array.isArray(
        response.data
      )
        ? response.data
        : [];
      const bestMatch =
        matches.find(
          (item) =>
            String(
              item?.symbol || ""
            ).toUpperCase() === symbol
        ) || matches[0];

      if (!bestMatch?.conid) {
        throw new Error(
          `No conid found for symbol ${symbol}.`
        );
      }

      return normalizeStockSummary(
        bestMatch,
        symbol
      );
    })
  );

  return results;
};

const ensureBrokerageSession = async () => {
  await ibkrApi.get("/sso/validate");

  const initResponse = await ibkrApi.post(
    "/iserver/auth/ssodh/init",
    {
      publish: true,
      compete: true,
    }
  );

  const accountsResponse = await ibkrApi.get("/iserver/accounts");

  return {
    init: initResponse.data,
    accounts: accountsResponse.data,
  };
};

export const confirmStatus = async (req, res) => {
  try {
    const response = await ibkrApi.get(
      `/iserver/auth/status`
    );
    const data = response.data;

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error?.response?.data || error);

    return res.status(500).json({
      connected: false,
      error:
        error?.response?.data ||
        error?.message ||
        "Something went wrong",
    });
  }
}

export const getStatus = async (req, res) => {
  try {
    const response = await ibkrApi.get(
      `/portfolio/${process.env.IBKR_ACCOUNT_ID}/summary`
    );

    const data = response.data;
    const accountCurrency =
      data?.netliquidation?.currency ||
      data?.availablefunds?.currency ||
      data?.buyingpower?.currency ||
      "USD";

    const dashboardData = {
      connected: true,
      accountId: process.env.IBKR_ACCOUNT_ID,
      currency: accountCurrency,

      metrics: {
        netLiquidation: {
          amount: data?.netliquidation?.amount ?? 0,
          currency:
            data?.netliquidation?.currency ??
            accountCurrency,
        },
        buyingPower: {
          amount: data?.buyingpower?.amount ?? 0,
          currency:
            data?.buyingpower?.currency ??
            accountCurrency,
        },

        availableFunds: {
          amount: data?.availablefunds?.amount ?? 0,
          currency:
            data?.availablefunds?.currency ??
            accountCurrency,
        },

        totalCashValue: {
          amount: data?.totalcashvalue?.amount ?? 0,
          currency:
            data?.totalcashvalue?.currency ??
            accountCurrency,
        },

        equityWithLoanValue: {
          amount: data?.equitywithloanvalue?.amount ?? 0,
          currency:
            data?.equitywithloanvalue?.currency ??
            accountCurrency,
        },

        accountReady:
          data?.accountready?.value === "true",

        accountType:
          data?.accounttype?.value ?? "",
      },
    };

    return res.status(200).json(dashboardData);
    // return res.status(200).json(data);
  } catch (error) {
    console.error(error?.response?.data || error);

    return res.status(500).json({
      connected: false,
      error:
        error?.response?.data ||
        error?.message ||
        "Something went wrong",
    });
  }
};

export const getPositions = async (req, res) => {
  try {
    const response = await ibkrApi.get(
      `/portfolio/${process.env.IBKR_ACCOUNT_ID}/positions/0`
    );

    const positions = response.data || [];

    const formattedPositions = positions.map(
      (position) => ({
        conid: position.conid,
        name: position.name,
        symbol: position.contractDesc,
        position: position.position,
        marketPrice: position.mktPrice,
        marketValue: position.mktValue,
        currency: position.currency,
        unrealizedPnL: position.unrealizedPnl,
        assetClass: position.assetClass,
        group: position.group,
        sector: position.sector,
        sectorGroup: position.sectorGroup,
      })
    );

    return res.status(200).json({
      success: true,
      // positions: positions,
      positions: formattedPositions,
    });
  } catch (error) {
    console.error(error?.response?.data || error);

    return res.status(500).json({
      success: false,
      error:
        error?.response?.data ||
        error?.message,
    });
  }
};

export const placeTestOrder = async (
  req,
  res
) => {
  try {
    const accountId =
      process.env.IBKR_ACCOUNT_ID;

    // AAPL conid
    const conid = 265598;

    const payload = {
      orders: [
        {
          conid,
          orderType: "MKT",
          side: "BUY",
          quantity: 1,
          tif: "DAY",
        },
      ],
    };

    const response =
      await ibkrApi.post(
        `/iserver/account/${accountId}/orders`,
        payload
      );

    return res.status(200).json({
      success: true,
      message:
        "Test order submitted",
      data: response.data,
    });
  } catch (error) {
    console.error(
      error?.response?.data ||
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error?.response?.data ||
        error?.message,
    });
  }
};

export const searchStockSummary = async (req, res) => {
  try {
    let symbol = req.params.symbol;

    if (!symbol) {
      return res.status(400).json({
        success: false,
        error: "Symbol parameter is required.",
      });
    } else {
      symbol = symbol.trim().toUpperCase();
    }

    await ensureBrokerageSession();

    const response = await getStockSummary(symbol);
    const matches = Array.isArray(
      response.data
    )
      ? response.data.map((item) =>
        normalizeStockSummary(
          item,
          symbol
        )
      )
      : [];

    return res.status(200).json({
      success: true,
      data: matches,
    });
  } catch (error) {
    console.error(error?.response?.data || error);

    return res.status(500).json({
      success: false,
      error:
        error?.response?.data ||
        error?.message,
    });
  }
}

export const getMarketData = async (req, res) => {
  try {
    const symbols = parseCsvParam(
      req.query.symbols
    ).map((item) =>
      item.trim().toUpperCase()
    );
    let conids = parseCsvParam(
      req.query.conids
    );
    const fields = parseCsvParam(
      req.query.fields ||
      DEFAULT_MARKET_FIELDS.join(",")
    );

    if (
      conids.length === 0 &&
      symbols.length === 0
    ) {
      conids = ["265598", "8314"];
    }

    if (
      conids.length === 0 &&
      symbols.length === 0
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Query param 'conids' or 'symbols' is required.",
      });
    }

    await ensureBrokerageSession();

    const resolvedSymbols =
      symbols.length > 0
        ? await resolveSymbolsToConids(
          symbols
        )
        : [];

    if (resolvedSymbols.length > 0) {
      conids = resolvedSymbols.map(
        (item) => String(item.conid)
      );
    }

    const response = await ibkrApi.get(
      `/iserver/marketdata/snapshot?conids=${conids.join(",")}&fields=${fields.join(",")}`
    );
    const snapshots = Array.isArray(
      response.data
    )
      ? response.data
      : [];
    const normalized = snapshots.map(
      (item) =>
        normalizeMarketSnapshot(
          item,
          fields
        )
    );

    return res.status(200).json({
      success: true,
      requested: {
        conids,
        symbols,
        fields,
      },
      resolvedSymbols,
      fieldLabels: fields.reduce(
        (acc, field) => {
          acc[field] =
            MARKET_FIELD_LABELS[field] ||
            `Field ${field}`;
          return acc;
        },
        {}
      ),
      data: normalized,
      raw: snapshots,
    });
  } catch (error) {
    console.error(error?.response?.data || error);

    const ibkrError =
      error?.response?.data ||
      error?.message;
    const isNoBridgeError =
      typeof ibkrError?.error ===
      "string" &&
      ibkrError.error
        .toLowerCase()
        .includes("no bridge");

    return res.status(
      isNoBridgeError ? 502 : 500
    ).json({
      success: false,
      error: isNoBridgeError
        ? {
          message:
            "IBKR brokerage session is not initialized. Log in to Client Portal Gateway, confirm the session is authenticated, and make sure /iserver/accounts succeeds before requesting market data.",
          details: ibkrError,
        }
        : ibkrError,
    });
  }
}

export const marketSummmaryData = async (req, res) => {
  try {
    const payload = {
      instrument: "STK",
      location: "STK.US",
      type: "MOST_ACTIVE",
      filter: [],
      numberOfRows: 100,
    };

    const response = await ibkrApi.post("/iserver/scanner/run", {
      ...payload
    });

    const data = response.data;

    return res.status(200).json({
      success: true,
      count: data?.contracts?.length,
      data,
    });
  } catch (error) {
    console.error(error?.response?.data || error);

    return res.status(500).json({
      success: false,
      error:
        error?.response?.data ||
        error?.message,
    });
  }
}

export async function getCachedIBKRMarkets(req, res) {
  try {
    const offset = Number(req.query.offset || 0);
    const limit = Math.min(Number(req.query.limit || 25), 100);

    const searchRaw = String(req.query.search || "").toLowerCase().trim();
    const cleanSearch = searchRaw.replace(/\s+/g, " ");

    const quality = String(req.query.quality || "all").toLowerCase();
    const minConfidence = Number(req.query.minConfidence || 0);

    if (!fs.existsSync(CACHE_FILE)) {
      return res.json({
        success: true,
        data: {
          total_results_count: 0,
          results: [],
        },
      });
    }

    const raw = await fsPromises.readFile(CACHE_FILE, "utf8");
    const cache = JSON.parse(raw);

    const markets = Array.isArray(cache.markets) ? cache.markets : [];

    /* ---------- Filter ---------- */
    let filtered = markets.filter((m) => {
      const identity = m.summary?.identity;
      const qualityLevel = m.summary?.marketQuality?.level;
      const confidenceScore = m.summary?.priceConfidence?.score ?? 0;

      if (!identity) return false;

      if (quality !== "all" && qualityLevel !== quality) return false;
      if (confidenceScore < minConfidence) return false;

      if (cleanSearch) {
        const haystack = [
          identity.symbol,
          identity.name,
          identity.primaryExchange,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(cleanSearch)) return false;
      }

      return true;
    });

    /* ---------- Sort ---------- */
    filtered.sort((a, b) => {
      const qa = a.summary?.marketQuality?.liquidityScore ?? 0;
      const qb = b.summary?.marketQuality?.liquidityScore ?? 0;
      return qb - qa;
    });

    const paginated = filtered.slice(offset, offset + limit);

    return res.json({
      success: true,
      cachedAt: cache.updatedAt,
      data: {
        total_results_count: filtered.length,
        offset,
        limit,
        hasMore: offset + limit < filtered.length,
        results: paginated,
      },
    });
  } catch (err) {
    console.error("getCachedIBKRMarkets error:", err);

    return res.status(500).json({
      success: false,
      error: err.message || "Failed to load IBKR cache",
    });
  }
}
