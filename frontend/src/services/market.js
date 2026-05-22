import api from "./api";

export const fetchMarketData = async ({
  conids,
  symbols,
  fields,
} = {}) => {
  const params = {};

  if (conids?.length) {
    params.conids = conids.join(",");
  }

  if (symbols?.length) {
    params.symbols = symbols.join(",");
  }

  if (fields?.length) {
    params.fields = fields.join(",");
  }

  const response = await api.get(
    "/ibkr/market-data",
    { params }
  );

  return response.data;
};

export const searchStockSummary = async (
  symbol
) => {
  const response = await api.get(
    `/ibkr/search-stock/${encodeURIComponent(symbol)}`
  );

  return response.data;
};
