import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  RefreshCw,
  Search,
  Radio,
} from "lucide-react";
import { fetchMarketData } from "@/services/market";
import {
  formatNumber,
} from "@/lib/formatters";
import { cn } from "@/lib/utils";

const DEFAULT_FIELDS = [
  "31",
  "55",
  "84",
  "86",
];

const DEFAULT_WATCHLIST = [
  {
    conid: "265598",
    symbol: "AAPL",
    label: "Apple",
  },
  {
    conid: "8314",
    symbol: "IBM",
    label: "IBM",
  },
  {
    conid: "272093",
    symbol: "MSFT",
    label: "Microsoft",
  },
  {
    conid: "76792991",
    symbol: "TSLA",
    label: "Tesla",
  },
];
const DEFAULT_WATCHLIST_CONIDS =
  DEFAULT_WATCHLIST.map(
    (item) => item.conid
  );

const Market = () => {
  const [customSymbols, setCustomSymbols] =
    useState("");
  const [marketState, setMarketState] =
    useState({
      loading: true,
      refreshing: false,
      error: "",
      rows: [],
      fieldLabels: {},
      resolvedSymbols: [],
    });

  const runMarketFetch = async ({
    conids,
    symbols,
    initial = false,
  }) => {
    setMarketState((current) => ({
      ...current,
      loading: initial,
      refreshing: !initial,
      error: "",
    }));

    try {
      const payload =
        await fetchMarketData({
          conids,
          symbols,
          fields: DEFAULT_FIELDS,
        });

      setMarketState({
        loading: false,
        refreshing: false,
        error: "",
        rows: payload.data || [],
        fieldLabels:
          payload.fieldLabels || {},
        resolvedSymbols:
          payload.resolvedSymbols || [],
      });
    } catch (error) {
      const apiError =
        error?.response?.data?.error;
      const message =
        apiError?.message ||
        apiError?.error ||
        error?.message ||
        "Unable to load market data.";

      setMarketState((current) => ({
        ...current,
        loading: false,
        refreshing: false,
        error: message,
        rows: [],
        resolvedSymbols: [],
      }));
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      runMarketFetch({
        conids:
          DEFAULT_WATCHLIST_CONIDS,
        initial: true,
      });
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  const totalQuotes =
    marketState.rows.length;
  const liveQuotes =
    marketState.rows.filter(
      (item) =>
        item.lastPrice !== null
    ).length;
  const averageSpread =
    marketState.rows.reduce(
      (sum, item) => {
        if (
          item.bidPrice === null ||
          item.askPrice === null
        ) {
          return sum;
        }

        return (
          sum +
          (item.askPrice -
            item.bidPrice)
        );
      },
      0
    );
  const spreadCount =
    marketState.rows.filter(
      (item) =>
        item.bidPrice !== null &&
        item.askPrice !== null
    ).length;

  const handleRefresh = () => {
    runMarketFetch({
      conids:
        DEFAULT_WATCHLIST_CONIDS,
    });
  };

  const handlePresetLoad = () => {
    runMarketFetch({
      conids:
        DEFAULT_WATCHLIST_CONIDS,
    });
  };

  const handleCustomLoad = () => {
    const parsed = customSymbols
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (parsed.length === 0) {
      setMarketState((current) => ({
        ...current,
        error:
          "Enter at least one symbol to request market data.",
      }));
      return;
    }

    runMarketFetch({
      symbols: parsed.map((item) =>
        item.toUpperCase()
      ),
    });
  };

  return (
    <>
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
        <div className="rounded-4xl border border-white/10 bg-white/6 p-6 shadow-[0_30px_100px_rgba(8,15,33,0.42)] backdrop-blur-xl sm:p-8">
          <Badge className="rounded-full bg-amber-400/12 px-3 py-1 text-amber-100 hover:bg-amber-400/12">
            Market workspace
          </Badge>

          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Build a watchlist around live IBKR snapshot data.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                The market page lets you pull quotes for a curated watchlist or custom conids, monitor spreads, and inspect the latest snapshot fields coming back from the backend.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleRefresh}
                disabled={
                  marketState.loading ||
                  marketState.refreshing
                }
                className="rounded-full border-white/12 bg-white/4 px-4 text-slate-100 hover:bg-white/10 hover:text-white"
              >
                <RefreshCw
                  className={cn(
                    "mr-2 size-4",
                    marketState.refreshing &&
                      "animate-spin"
                  )}
                />
                Refresh quotes
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-4xl border border-white/10 bg-slate-950/72 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.24)] backdrop-blur-xl sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">
            Snapshot health
          </p>

          <div className="mt-5 space-y-4">
            <div className="rounded-3xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">Instruments requested</p>
              <p className="mt-2 text-lg font-medium text-white">
                {
                  DEFAULT_WATCHLIST.length
                }
              </p>
            </div>

            <div className="rounded-3xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">Quotes returned</p>
              <p className="mt-2 text-lg font-medium text-white">
                {totalQuotes}
              </p>
            </div>

            <div className="rounded-3xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">Quotes with last price</p>
              <p className="mt-2 text-lg font-medium text-white">
                {liveQuotes}
              </p>
            </div>

            <div className="rounded-3xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">Average spread</p>
              <p className="mt-2 text-lg font-medium text-white">
                {spreadCount > 0
                  ? formatNumber(
                      averageSpread /
                        spreadCount,
                      2
                    )
                  : "--"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {marketState.error ? (
        <section className="mt-6 rounded-[28px] border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
          {marketState.error}
        </section>
      ) : null}

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="rounded-[30px] border-white/10 bg-slate-900/65 backdrop-blur-xl">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Default watchlist
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  These presets load through the same market snapshot API and give you a quick baseline watchlist.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handlePresetLoad}
                disabled={
                  marketState.loading ||
                  marketState.refreshing
                }
                className="rounded-full border-white/12 bg-white/4 px-4 text-slate-100 hover:bg-white/10 hover:text-white"
              >
                <Radio className="mr-2 size-4" />
                Load presets
              </Button>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {DEFAULT_WATCHLIST.map((item) => (
                <div
                  key={item.conid}
                  className="rounded-3xl border border-white/10 bg-white/5 p-4"
                >
                  <p className="text-base font-semibold text-white">
                    {item.symbol}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-[0.24em] text-slate-500">
                    Symbol {item.symbol}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border-white/10 bg-slate-900/65 backdrop-blur-xl">
          <CardContent className="p-5 sm:p-6">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Custom symbol lookup
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Enter one or more stock symbols separated by commas. The backend resolves them to conids first.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <Input
                value={customSymbols}
                onChange={(event) =>
                  setCustomSymbols(
                    event.target.value
                  )
                }
                placeholder="AAPL, IBM, MSFT"
                className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-slate-500"
              />

              <Button
                type="button"
                onClick={handleCustomLoad}
                disabled={
                  marketState.loading ||
                  marketState.refreshing
                }
                className="w-full rounded-2xl bg-cyan-400/80 text-slate-950 hover:bg-cyan-300"
              >
                <Search className="mr-2 size-4" />
                Fetch by symbol
              </Button>
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Symbol resolution</p>
              <div className="mt-3 space-y-2">
                {marketState.resolvedSymbols
                  .length > 0 ? (
                  marketState.resolvedSymbols.map(
                    (item) => (
                      <div
                        key={`${item.requestedSymbol}-${item.conid}`}
                        className="rounded-2xl bg-slate-950/45 px-3 py-2"
                      >
                        <p className="text-sm font-medium text-white">
                          {item.requestedSymbol} → {item.conid}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {item.companyName || item.symbol || "--"}
                        </p>
                      </div>
                    )
                  )
                ) : (
                  <p className="text-sm text-slate-500">
                    Resolved symbols will appear here after a symbol-based lookup.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Snapshot fields</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(
                  marketState.fieldLabels
                ).map(([field, label]) => (
                  <Badge
                    key={field}
                    variant="outline"
                    className="rounded-full border-white/10 bg-white/5 px-3 text-slate-200"
                  >
                    {field}: {label}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 rounded-4xl border border-white/10 bg-slate-900/65 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.24)] backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Market snapshots
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Latest data coming from `/api/ibkr/market-data`.
            </p>
          </div>

          <Badge
            variant="outline"
            className="w-fit rounded-full border-white/10 bg-white/5 px-3 text-slate-200"
          >
            {marketState.rows.length} rows
          </Badge>
        </div>

        {marketState.loading ? (
          <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-white/4 px-5 py-10 text-center text-slate-300">
            Loading market snapshots...
          </div>
        ) : marketState.rows.length > 0 ? (
          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {marketState.rows.map((item) => (
              <article
                key={item.conid || item.symbol}
                className="rounded-3xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {item.symbol || "--"}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Conid {item.conid || "--"}
                    </p>
                  </div>

                  <Badge
                    variant="secondary"
                    className="rounded-full border border-white/10 bg-white/8 text-slate-200"
                  >
                    Snapshot
                  </Badge>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-950/50 p-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Last
                    </p>
                    <p className="mt-2 text-lg font-medium text-white">
                      {item.lastPrice !== null
                        ? formatNumber(
                            item.lastPrice,
                            2
                          )
                        : "--"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-950/50 p-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Spread
                    </p>
                    <p className="mt-2 text-lg font-medium text-white">
                      {item.bidPrice !== null &&
                      item.askPrice !== null
                        ? formatNumber(
                            item.askPrice -
                              item.bidPrice,
                            2
                          )
                        : "--"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-950/50 p-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Bid
                    </p>
                    <p className="mt-2 text-lg font-medium text-white">
                      {item.bidPrice !== null
                        ? formatNumber(
                            item.bidPrice,
                            2
                          )
                        : "--"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-950/50 p-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Ask
                    </p>
                    <p className="mt-2 text-lg font-medium text-white">
                      {item.askPrice !== null
                        ? formatNumber(
                            item.askPrice,
                            2
                          )
                        : "--"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/45 p-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    Raw field payload
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {Object.entries(
                      item.rawFields || {}
                    ).map(([field, value]) => (
                      <div
                        key={field}
                        className="rounded-xl bg-white/5 px-3 py-2"
                      >
                        <p className="text-xs text-slate-500">
                          {marketState
                            .fieldLabels?.[
                            field
                          ] || `Field ${field}`}
                        </p>
                        <p className="mt-1 text-sm text-white">
                          {String(value ?? "--")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-white/4 px-5 py-10 text-center">
            <p className="text-base font-medium text-white">
              No market snapshots yet
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Load the default watchlist or enter custom symbols to pull market data.
            </p>
          </div>
        )}
      </section>
    </>
  );
};

export default Market;
