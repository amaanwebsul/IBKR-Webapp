import PositionsTable from "@/components/dashboard/PositionsTable";
import StatsCard from "@/components/dashboard/StatsCard";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  BadgeDollarSign,
  Landmark,
  Wallet,
} from "lucide-react";
import { useIbkr } from "../hooks/useIbkr";
import {
  formatCompactCurrency,
  formatCurrency,
} from "@/lib/formatters";

const Dashboard = () => {
  const {
    dashboardData,
    positions,
    loading,
    error,
  } = useIbkr();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-slate-200">
        Loading dashboard...
      </div>
    );
  }

  const metrics = dashboardData?.metrics || {};
  const accountHealth = dashboardData?.connected
    ? metrics.accountReady
      ? "Account ready"
      : "Connected with pending readiness"
    : "API connection unavailable";

  const overviewItems = [
    {
      title: "Net liquidation",
      value: formatCurrency(metrics.netLiquidation),
      subtitle: "Total account value",
      icon: Landmark,
      tone: "accent",
    },
    {
      title: "Buying power",
      value: formatCurrency(metrics.buyingPower),
      subtitle: "Deployable capital",
      icon: BadgeDollarSign,
    },
    {
      title: "Available funds",
      value: formatCurrency(metrics.availableFunds),
      subtitle: "Immediate liquidity",
      icon: Wallet,
    },
    {
      title: "Cash value",
      value: formatCurrency(metrics.totalCashValue),
      subtitle: "Uninvested balance",
      icon: Activity,
    },
  ];

  return (
    <>
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
        <div className="rounded-4xl border border-white/10 bg-white/6 p-6 shadow-[0_30px_100px_rgba(8,15,33,0.42)] backdrop-blur-xl sm:p-8">
          <Badge className="rounded-full bg-cyan-400/12 px-3 py-1 text-cyan-100 hover:bg-cyan-400/12">
            IBKR account pulse
          </Badge>

          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Monitor liquidity, exposure, and position health in one place.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                The dashboard surfaces the core IBKR account metrics first, then moves into position-level detail for faster decision making during market hours.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
              <div className="rounded-3xl border border-white/10 bg-slate-950/55 p-4">
                <p className="text-sm text-slate-400">Portfolio value</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {formatCompactCurrency(metrics.netLiquidation)}
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/55 p-4">
                <p className="text-sm text-slate-400">Open positions</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {positions.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-4xl border border-white/10 bg-slate-950/72 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.24)] backdrop-blur-xl sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">
            Account details
          </p>

          <div className="mt-5 space-y-4">
            <div className="rounded-3xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">Account ID</p>
              <p className="mt-2 text-lg font-medium text-white">
                {dashboardData?.accountId || "--"}
              </p>
            </div>

            <div className="rounded-3xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">Account type</p>
              <p className="mt-2 text-lg font-medium text-white">
                {metrics.accountType || "--"}
              </p>
            </div>

            <div className="rounded-3xl border border-cyan-400/16 bg-cyan-400/10 p-4">
              <p className="text-sm text-cyan-100/75">Readiness</p>
              <p className="mt-2 text-lg font-medium text-white">
                {accountHealth}
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

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewItems.map((item) => (
          <StatsCard
            key={item.title}
            title={item.title}
            value={item.value}
            subtitle={item.subtitle}
            icon={item.icon}
            tone={item.tone}
          />
        ))}
      </section>

      <div className="mt-6">
        <PositionsTable positions={positions} />
      </div>
    </>
  );
};

export default Dashboard;
