import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/formatters";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { useIbkr } from "../../hooks/useIbkr";
import { useLocation } from "react-router-dom";

const pageMeta = {
  "/": {
    title: "Trading dashboard",
    description: "Account metrics and live account health.",
  },
  "/portfolio": {
    title: "Portfolio",
    description: "Allocation, concentration, and holdings breakdown.",
  },
  "/market": {
    title: "Market",
    description: "Reserved for market data and watchlists.",
  },
  "/orders": {
    title: "Orders",
    description: "Reserved for order entry and execution history.",
  },
};

const Header = () => {
  const {
    dashboardData,
    lastUpdated,
    refreshDashboard,
    refreshing,
  } = useIbkr();
  const location = useLocation();
  const currentPage =
    pageMeta[location.pathname] ||
    pageMeta["/"];

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white sm:text-2xl">
            {currentPage.title}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {currentPage.description} Last sync {formatDateTime(lastUpdated)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge className="h-8 rounded-full bg-white/10 px-3 text-slate-100 hover:bg-white/10">
            <ShieldCheck className="mr-1 size-3.5" />
            {dashboardData?.connected
              ? "Connected"
              : "Disconnected"}
          </Badge>

          <Badge
            variant="secondary"
            className="h-8 rounded-full border border-white/10 bg-white/6 px-3 text-slate-200"
          >
            Paper trading
          </Badge>

          <Button
            type="button"
            variant="outline"
            onClick={() => refreshDashboard()}
            disabled={refreshing}
            className="h-8 rounded-full border-white/12 bg-white/4 px-3 text-slate-100 hover:bg-white/10 hover:text-white cursor-pointer data-[state=open]:bg-white/10"
          >
            <RefreshCw
              className={`mr-2 size-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
