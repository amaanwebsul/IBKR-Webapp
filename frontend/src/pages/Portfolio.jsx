import PositionsTable from "@/components/dashboard/PositionsTable";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatCompactCurrency,
  formatCurrency,
  formatNumber,
  getMoneyCurrency,
} from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useIbkr } from "@/hooks/useIbkr";

const buildGroupedSummary = (
  positions,
  keyName
) => {
  const totals = positions.reduce(
    (acc, item) => {
      const key = item[keyName] || "Unclassified";
      const value = Math.abs(
        Number(item.marketValue) || 0
      );

      acc[key] = (acc[key] || 0) + value;
      return acc;
    },
    {}
  );

  const grandTotal = Object.values(totals).reduce(
    (sum, value) => sum + value,
    0
  );

  return Object.entries(totals)
    .map(([label, value]) => ({
      label,
      value,
      share:
        grandTotal > 0
          ? (value / grandTotal) * 100
          : 0,
    }))
    .sort((a, b) => b.value - a.value);
};

const Portfolio = () => {
  const {
    positions,
    dashboardData,
    error,
  } = useIbkr();

  const metrics = dashboardData?.metrics || {};
  const accountCurrency =
    dashboardData?.currency ||
    getMoneyCurrency(
      metrics.netLiquidation,
      "USD"
    );
  const totalExposure = positions.reduce(
    (sum, item) =>
      sum +
      Math.abs(Number(item.marketValue) || 0),
    0
  );
  const totalPnL = positions.reduce(
    (sum, item) =>
      sum +
      (Number(item.unrealizedPnL) || 0),
    0
  );
  const longPositions = positions.filter(
    (item) => Number(item.position) > 0
  ).length;
  const groupedBySector =
    buildGroupedSummary(
      positions,
      "sectorGroup"
    ).slice(0, 5);
  const groupedByAssetClass =
    buildGroupedSummary(
      positions,
      "assetClass"
    ).slice(0, 4);
  const topHoldings = [...positions]
    .sort(
      (a, b) =>
        Math.abs(
          Number(b.marketValue) || 0
        ) -
        Math.abs(
          Number(a.marketValue) || 0
        )
    )
    .slice(0, 5);

  return (
    <>
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_360px]">
        <div className="rounded-4xl border border-white/10 bg-white/6 p-6 shadow-[0_30px_100px_rgba(8,15,33,0.42)] backdrop-blur-xl sm:p-8">
          <Badge className="rounded-full bg-emerald-400/12 px-3 py-1 text-emerald-100 hover:bg-emerald-400/12">
            Portfolio overview
          </Badge>

          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Allocation and risk concentration at a glance.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                This page breaks the account into exposure, sector concentration, asset class mix, and your highest-value holdings.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
              <div className="rounded-3xl border border-white/10 bg-slate-950/55 p-4">
                <p className="text-sm text-slate-400">Net liquidation</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {formatCompactCurrency(
                    metrics.netLiquidation,
                    accountCurrency
                  )}
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/55 p-4">
                <p className="text-sm text-slate-400">Total exposure</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {formatCompactCurrency(
                    totalExposure,
                    accountCurrency
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-4xl border border-white/10 bg-slate-950/72 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.24)] backdrop-blur-xl sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">
            Quick stats
          </p>

          <div className="mt-5 space-y-4">
            <div className="rounded-3xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">Open positions</p>
              <p className="mt-2 text-lg font-medium text-white">
                {positions.length}
              </p>
            </div>

            <div className="rounded-3xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">Long positions</p>
              <p className="mt-2 text-lg font-medium text-white">
                {longPositions}
              </p>
            </div>

            <div className="rounded-3xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">Unrealized PnL</p>
              <p
                className={cn(
                  "mt-2 text-lg font-medium",
                  totalPnL >= 0
                    ? "text-emerald-300"
                    : "text-rose-300"
                )}
              >
                {formatCurrency(
                  totalPnL,
                  accountCurrency,
                  2
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <section className="mt-6 rounded-[28px] border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
          {error}
        </section>
      ) : null}

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card className="rounded-[30px] border-white/10 bg-slate-900/65 backdrop-blur-xl">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Sector allocation
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Largest concentration buckets by market value.
                </p>
              </div>
              <Badge
                variant="outline"
                className="rounded-full border-white/10 bg-white/5 px-3 text-slate-200"
              >
                Top 5
              </Badge>
            </div>

            <div className="mt-6 space-y-4">
              {groupedBySector.length > 0 ? (
                groupedBySector.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-medium text-white">
                        {item.label}
                      </p>
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">
                          {formatCurrency(
                            item.value,
                            accountCurrency
                          )}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatNumber(item.share, 1)}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 h-2 rounded-full bg-white/8">
                      <div
                        className="h-2 rounded-full bg-cyan-300"
                        style={{
                          width: `${Math.min(
                            item.share,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">
                  No sector data available.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border-white/10 bg-slate-900/65 backdrop-blur-xl">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Asset class mix
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Exposure split by asset classification.
                </p>
              </div>
              <Badge
                variant="outline"
                className="rounded-full border-white/10 bg-white/5 px-3 text-slate-200"
              >
                Top 4
              </Badge>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {groupedByAssetClass.length > 0 ? (
                groupedByAssetClass.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-3xl border border-white/10 bg-white/5 p-4"
                  >
                    <p className="text-sm text-slate-400">
                      {item.label}
                    </p>
                    <p className="mt-2 text-xl font-semibold text-white">
                      {formatCompactCurrency(
                        item.value,
                        accountCurrency
                      )}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatNumber(item.share, 1)}% of portfolio exposure
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">
                  No asset class data available.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 rounded-4xl border border-white/10 bg-slate-900/65 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.24)] backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Top holdings
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Highest exposure positions ranked by absolute market value.
            </p>
          </div>
          <Badge
            variant="outline"
            className="w-fit rounded-full border-white/10 bg-white/5 px-3 text-slate-200"
          >
            Ranked by value
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {topHoldings.length > 0 ? (
            topHoldings.map((item) => (
              <div
                key={item.conid}
                className="rounded-3xl border border-white/10 bg-white/5 p-4"
              >
                <p className="text-base font-semibold text-white">
                  {item.symbol}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {item.name || "Unnamed instrument"}
                </p>
                <p className="mt-4 text-xl font-semibold text-white">
                  {formatCompactCurrency(
                    item.marketValue,
                    item.currency
                  )}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Qty {formatNumber(item.position)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">
              No holdings available.
            </p>
          )}
        </div>
      </section>

      <div className="mt-6">
        <PositionsTable positions={positions} />
      </div>
    </>
  );
};

export default Portfolio;
