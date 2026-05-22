import ibkrApi from "../services/ibkrService.js";

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

export const confirmStatus = async(req, res) => {
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

export const getMarketData = async(req, res) => {
  try {
    const conids =
      req.query.conids || "265598,8314";
    const fields =
      req.query.fields || "31,55,84,86";

    if (!conids) {
      return res.status(400).json({
        success: false,
        error:
          "Query param 'conids' is required.",
      });
    }

    await ensureBrokerageSession();

    const response = await ibkrApi.get(
      `/iserver/marketdata/snapshot?conids=${conids}&fields=${fields}`
    );

    return res.status(200).json({
      success: true,
      data: response.data,
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
