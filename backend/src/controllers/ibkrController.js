import ibkrApi from "../services/ibkrService.js";

export const getStatus = async (req, res) => {
  try {
    const response = await ibkrApi.get(
      `/portfolio/${process.env.IBKR_ACCOUNT_ID}/summary`
    );

    const data = response.data;

    const dashboardData = {
      connected: true,
      accountId: process.env.IBKR_ACCOUNT_ID,

      metrics: {
        netLiquidation:
          data?.netliquidation?.amount ?? 0,

        buyingPower:
          data?.buyingpower?.amount ?? 0,

        availableFunds:
          data?.availablefunds?.amount ?? 0,

        totalCashValue:
          data?.totalcashvalue?.amount ?? 0,

        equityWithLoanValue:
          data?.equitywithloanvalue?.amount ?? 0,

        accountReady:
          data?.accountready?.value === "true",

        accountType:
          data?.accounttype?.value ?? "",
      },
    };

    return res.status(200).json(dashboardData);
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