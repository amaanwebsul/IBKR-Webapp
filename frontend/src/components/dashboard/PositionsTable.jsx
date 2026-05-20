import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatCurrency,
  formatNumber,
} from "@/lib/formatters";
import { cn } from "@/lib/utils";

const PositionsTable = ({
  positions,
}) => {
  const hasPositions = positions.length > 0;

  return (
    <section className="rounded-4xl border border-white/10 bg-slate-900/65 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.24)] backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white sm:text-xl">
            Live positions
          </h2>
          <p className="text-sm text-slate-400">
            Holdings streamed from your IBKR account.
          </p>
        </div>

        <Badge
          variant="outline"
          className="w-fit rounded-full border-white/10 bg-white/5 px-3 py-1 text-slate-200"
        >
          {positions.length} instruments
        </Badge>
      </div>

      {hasPositions ? (
        <>
          <div className="mt-6 grid gap-4 lg:hidden">
            {positions.map((item) => (
              <article
                key={item.conid}
                className="rounded-3xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-white">
                      {item.symbol}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {item.name || "Unnamed instrument"}
                    </p>
                  </div>

                  <Badge
                    variant="secondary"
                    className="rounded-full border border-white/10 bg-white/8 text-slate-200"
                  >
                    {item.sectorGroup || item.assetClass || "Position"}
                  </Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-slate-950/50 p-3">
                    <p className="text-slate-500">Quantity</p>
                    <p className="mt-1 font-medium text-white">
                      {formatNumber(item.position)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-950/50 p-3">
                    <p className="text-slate-500">Market price</p>
                    <p className="mt-1 font-medium text-white">
                      {formatCurrency(item.marketPrice, item.currency)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-950/50 p-3">
                    <p className="text-slate-500">Market value</p>
                    <p className="mt-1 font-medium text-white">
                      {formatCurrency(item.marketValue, item.currency)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-950/50 p-3">
                    <p className="text-slate-500">Unrealized PnL</p>
                    <p
                      className={cn(
                        "mt-1 font-medium",
                        Number(item.unrealizedPnL) >= 0
                          ? "text-emerald-300"
                          : "text-rose-300"
                      )}
                    >
                      {formatCurrency(item.unrealizedPnL, item.currency, 2)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="px-4 text-slate-400">Name</TableHead>
                  <TableHead className="px-4 text-slate-400">Symbol</TableHead>
                  <TableHead className="px-4 text-slate-400">Qty</TableHead>
                  <TableHead className="px-4 text-slate-400">Price</TableHead>
                  <TableHead className="px-4 text-slate-400">Value</TableHead>
                  <TableHead className="px-4 text-slate-400">PnL</TableHead>
                  <TableHead className="px-4 text-slate-400">Sector</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {positions.map((item) => (
                  <TableRow
                    key={item.conid}
                    className="border-white/8 hover:bg-white/4"
                  >
                    <TableCell className="px-4 py-4 text-white">
                      {item.name}
                    </TableCell>
                    <TableCell className="px-4 py-4 font-medium text-slate-200">
                      {item.symbol}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-slate-300">
                      {formatNumber(item.position)}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-slate-300">
                      {formatCurrency(item.marketPrice, item.currency)}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-slate-300">
                      {formatCurrency(item.marketValue, item.currency)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "px-4 py-4 font-medium",
                        Number(item.unrealizedPnL) >= 0
                          ? "text-emerald-300"
                          : "text-rose-300"
                      )}
                    >
                      {formatCurrency(item.unrealizedPnL, item.currency, 2)}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-slate-400">
                      {item.sectorGroup || item.assetClass || "--"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-white/4 px-5 py-10 text-center">
          <p className="text-base font-medium text-white">
            No open positions
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Once positions are available, they will appear here with live mark-to-market values.
          </p>
        </div>
      )}
    </section>
  );
};

export default PositionsTable;
