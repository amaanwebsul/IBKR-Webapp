// import { useEffect, useState } from "react";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   RefreshCw,
//   Search,
//   Radio,
// } from "lucide-react";
// import { fetchMarketData } from "@/services/market";
// import {
//   formatNumber,
// } from "@/lib/formatters";
// import { cn } from "@/lib/utils";

// const DEFAULT_FIELDS = [
//   "31",
//   "55",
//   "84",
//   "86",
// ];

// const DEFAULT_WATCHLIST = [
//   {
//     conid: "265598",
//     symbol: "AAPL",
//     label: "Apple",
//   },
//   {
//     conid: "8314",
//     symbol: "IBM",
//     label: "IBM",
//   },
//   {
//     conid: "272093",
//     symbol: "MSFT",
//     label: "Microsoft",
//   },
//   {
//     conid: "76792991",
//     symbol: "TSLA",
//     label: "Tesla",
//   },
// ];
// const DEFAULT_WATCHLIST_CONIDS =
//   DEFAULT_WATCHLIST.map(
//     (item) => item.conid
//   );

// const Market = () => {
//   const [customSymbols, setCustomSymbols] =
//     useState("");
//   const [marketState, setMarketState] =
//     useState({
//       loading: true,
//       refreshing: false,
//       error: "",
//       rows: [],
//       fieldLabels: {},
//       resolvedSymbols: [],
//     });

//   const runMarketFetch = async ({
//     conids,
//     symbols,
//     initial = false,
//   }) => {
//     setMarketState((current) => ({
//       ...current,
//       loading: initial,
//       refreshing: !initial,
//       error: "",
//     }));

//     try {
//       const payload =
//         await fetchMarketData({
//           conids,
//           symbols,
//           fields: DEFAULT_FIELDS,
//         });

//       setMarketState({
//         loading: false,
//         refreshing: false,
//         error: "",
//         rows: payload.data || [],
//         fieldLabels:
//           payload.fieldLabels || {},
//         resolvedSymbols:
//           payload.resolvedSymbols || [],
//       });
//     } catch (error) {
//       const apiError =
//         error?.response?.data?.error;
//       const message =
//         apiError?.message ||
//         apiError?.error ||
//         error?.message ||
//         "Unable to load market data.";

//       setMarketState((current) => ({
//         ...current,
//         loading: false,
//         refreshing: false,
//         error: message,
//         rows: [],
//         resolvedSymbols: [],
//       }));
//     }
//   };

//   useEffect(() => {
//     const timeoutId = setTimeout(() => {
//       runMarketFetch({
//         conids:
//           DEFAULT_WATCHLIST_CONIDS,
//         initial: true,
//       });
//     }, 0);

//     return () => clearTimeout(timeoutId);
//   }, []);

//   const totalQuotes =
//     marketState.rows.length;
//   const liveQuotes =
//     marketState.rows.filter(
//       (item) =>
//         item.lastPrice !== null
//     ).length;
//   const averageSpread =
//     marketState.rows.reduce(
//       (sum, item) => {
//         if (
//           item.bidPrice === null ||
//           item.askPrice === null
//         ) {
//           return sum;
//         }

//         return (
//           sum +
//           (item.askPrice -
//             item.bidPrice)
//         );
//       },
//       0
//     );
//   const spreadCount =
//     marketState.rows.filter(
//       (item) =>
//         item.bidPrice !== null &&
//         item.askPrice !== null
//     ).length;

//   const handleRefresh = () => {
//     runMarketFetch({
//       conids:
//         DEFAULT_WATCHLIST_CONIDS,
//     });
//   };

//   const handlePresetLoad = () => {
//     runMarketFetch({
//       conids:
//         DEFAULT_WATCHLIST_CONIDS,
//     });
//   };

//   const handleCustomLoad = () => {
//     const parsed = customSymbols
//       .split(",")
//       .map((item) => item.trim())
//       .filter(Boolean);

//     if (parsed.length === 0) {
//       setMarketState((current) => ({
//         ...current,
//         error:
//           "Enter at least one symbol to request market data.",
//       }));
//       return;
//     }

//     runMarketFetch({
//       symbols: parsed.map((item) =>
//         item.toUpperCase()
//       ),
//     });
//   };

//   return (
//     <>
//       <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
//         <div className="rounded-4xl border border-white/10 bg-white/6 p-6 shadow-[0_30px_100px_rgba(8,15,33,0.42)] backdrop-blur-xl sm:p-8">
//           <Badge className="rounded-full bg-amber-400/12 px-3 py-1 text-amber-100 hover:bg-amber-400/12">
//             Market workspace
//           </Badge>

//           <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
//             <div className="max-w-2xl">
//               <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
//                 Build a watchlist around live IBKR snapshot data.
//               </h1>
//               <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
//                 The market page lets you pull quotes for a curated watchlist or custom conids, monitor spreads, and inspect the latest snapshot fields coming back from the backend.
//               </p>
//             </div>

//             <div className="flex flex-wrap gap-2">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={handleRefresh}
//                 disabled={
//                   marketState.loading ||
//                   marketState.refreshing
//                 }
//                 className="rounded-full border-white/12 bg-white/4 px-4 text-slate-100 hover:bg-white/10 hover:text-white"
//               >
//                 <RefreshCw
//                   className={cn(
//                     "mr-2 size-4",
//                     marketState.refreshing &&
//                       "animate-spin"
//                   )}
//                 />
//                 Refresh quotes
//               </Button>
//             </div>
//           </div>
//         </div>

//         <div className="rounded-4xl border border-white/10 bg-slate-950/72 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.24)] backdrop-blur-xl sm:p-7">
//           <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">
//             Snapshot health
//           </p>

//           <div className="mt-5 space-y-4">
//             <div className="rounded-3xl bg-white/5 p-4">
//               <p className="text-sm text-slate-400">Instruments requested</p>
//               <p className="mt-2 text-lg font-medium text-white">
//                 {
//                   DEFAULT_WATCHLIST.length
//                 }
//               </p>
//             </div>

//             <div className="rounded-3xl bg-white/5 p-4">
//               <p className="text-sm text-slate-400">Quotes returned</p>
//               <p className="mt-2 text-lg font-medium text-white">
//                 {totalQuotes}
//               </p>
//             </div>

//             <div className="rounded-3xl bg-white/5 p-4">
//               <p className="text-sm text-slate-400">Quotes with last price</p>
//               <p className="mt-2 text-lg font-medium text-white">
//                 {liveQuotes}
//               </p>
//             </div>

//             <div className="rounded-3xl bg-white/5 p-4">
//               <p className="text-sm text-slate-400">Average spread</p>
//               <p className="mt-2 text-lg font-medium text-white">
//                 {spreadCount > 0
//                   ? formatNumber(
//                       averageSpread /
//                         spreadCount,
//                       2
//                     )
//                   : "--"}
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {marketState.error ? (
//         <section className="mt-6 rounded-[28px] border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
//           {marketState.error}
//         </section>
//       ) : null}

//       <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
//         <Card className="rounded-[30px] border-white/10 bg-slate-900/65 backdrop-blur-xl">
//           <CardContent className="p-5 sm:p-6">
//             <div className="flex items-center justify-between gap-3">
//               <div>
//                 <h2 className="text-xl font-semibold text-white">
//                   Default watchlist
//                 </h2>
//                 <p className="mt-1 text-sm text-slate-400">
//                   These presets load through the same market snapshot API and give you a quick baseline watchlist.
//                 </p>
//               </div>

//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={handlePresetLoad}
//                 disabled={
//                   marketState.loading ||
//                   marketState.refreshing
//                 }
//                 className="rounded-full border-white/12 bg-white/4 px-4 text-slate-100 hover:bg-white/10 hover:text-white"
//               >
//                 <Radio className="mr-2 size-4" />
//                 Load presets
//               </Button>
//             </div>

//             <div className="mt-6 grid gap-3 md:grid-cols-2">
//               {DEFAULT_WATCHLIST.map((item) => (
//                 <div
//                   key={item.conid}
//                   className="rounded-3xl border border-white/10 bg-white/5 p-4"
//                 >
//                   <p className="text-base font-semibold text-white">
//                     {item.symbol}
//                   </p>
//                   <p className="mt-1 text-sm text-slate-400">
//                     {item.label}
//                   </p>
//                   <p className="mt-3 text-xs uppercase tracking-[0.24em] text-slate-500">
//                     Symbol {item.symbol}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="rounded-[30px] border-white/10 bg-slate-900/65 backdrop-blur-xl">
//           <CardContent className="p-5 sm:p-6">
//             <div>
//               <h2 className="text-xl font-semibold text-white">
//                 Custom symbol lookup
//               </h2>
//               <p className="mt-1 text-sm text-slate-400">
//                 Enter one or more stock symbols separated by commas. The backend resolves them to conids first.
//               </p>
//             </div>

//             <div className="mt-6 space-y-3">
//               <Input
//                 value={customSymbols}
//                 onChange={(event) =>
//                   setCustomSymbols(
//                     event.target.value
//                   )
//                 }
//                 placeholder="AAPL, IBM, MSFT"
//                 className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-slate-500"
//               />

//               <Button
//                 type="button"
//                 onClick={handleCustomLoad}
//                 disabled={
//                   marketState.loading ||
//                   marketState.refreshing
//                 }
//                 className="w-full rounded-2xl bg-cyan-400/80 text-slate-950 hover:bg-cyan-300"
//               >
//                 <Search className="mr-2 size-4" />
//                 Fetch by symbol
//               </Button>
//             </div>

//             <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
//               <p className="text-sm text-slate-400">Symbol resolution</p>
//               <div className="mt-3 space-y-2">
//                 {marketState.resolvedSymbols
//                   .length > 0 ? (
//                   marketState.resolvedSymbols.map(
//                     (item) => (
//                       <div
//                         key={`${item.requestedSymbol}-${item.conid}`}
//                         className="rounded-2xl bg-slate-950/45 px-3 py-2"
//                       >
//                         <p className="text-sm font-medium text-white">
//                           {item.requestedSymbol} → {item.conid}
//                         </p>
//                         <p className="mt-1 text-xs text-slate-400">
//                           {item.companyName || item.symbol || "--"}
//                         </p>
//                       </div>
//                     )
//                   )
//                 ) : (
//                   <p className="text-sm text-slate-500">
//                     Resolved symbols will appear here after a symbol-based lookup.
//                   </p>
//                 )}
//               </div>
//             </div>

//             <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
//               <p className="text-sm text-slate-400">Snapshot fields</p>
//               <div className="mt-3 flex flex-wrap gap-2">
//                 {Object.entries(
//                   marketState.fieldLabels
//                 ).map(([field, label]) => (
//                   <Badge
//                     key={field}
//                     variant="outline"
//                     className="rounded-full border-white/10 bg-white/5 px-3 text-slate-200"
//                   >
//                     {field}: {label}
//                   </Badge>
//                 ))}
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </section>

//       <section className="mt-6 rounded-4xl border border-white/10 bg-slate-900/65 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.24)] backdrop-blur-xl sm:p-6">
//         <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
//           <div>
//             <h2 className="text-xl font-semibold text-white">
//               Market snapshots
//             </h2>
//             <p className="mt-1 text-sm text-slate-400">
//               Latest data coming from `/api/ibkr/market-data`.
//             </p>
//           </div>

//           <Badge
//             variant="outline"
//             className="w-fit rounded-full border-white/10 bg-white/5 px-3 text-slate-200"
//           >
//             {marketState.rows.length} rows
//           </Badge>
//         </div>

//         {marketState.loading ? (
//           <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-white/4 px-5 py-10 text-center text-slate-300">
//             Loading market snapshots...
//           </div>
//         ) : marketState.rows.length > 0 ? (
//           <div className="mt-6 grid gap-4 xl:grid-cols-2">
//             {marketState.rows.map((item) => (
//               <article
//                 key={item.conid || item.symbol}
//                 className="rounded-3xl border border-white/10 bg-white/5 p-5"
//               >
//                 <div className="flex items-start justify-between gap-4">
//                   <div>
//                     <p className="text-lg font-semibold text-white">
//                       {item.symbol || "--"}
//                     </p>
//                     <p className="mt-1 text-sm text-slate-400">
//                       Conid {item.conid || "--"}
//                     </p>
//                   </div>

//                   <Badge
//                     variant="secondary"
//                     className="rounded-full border border-white/10 bg-white/8 text-slate-200"
//                   >
//                     Snapshot
//                   </Badge>
//                 </div>

//                 <div className="mt-5 grid grid-cols-2 gap-3">
//                   <div className="rounded-2xl bg-slate-950/50 p-3">
//                     <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
//                       Last
//                     </p>
//                     <p className="mt-2 text-lg font-medium text-white">
//                       {item.lastPrice !== null
//                         ? formatNumber(
//                             item.lastPrice,
//                             2
//                           )
//                         : "--"}
//                     </p>
//                   </div>

//                   <div className="rounded-2xl bg-slate-950/50 p-3">
//                     <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
//                       Spread
//                     </p>
//                     <p className="mt-2 text-lg font-medium text-white">
//                       {item.bidPrice !== null &&
//                       item.askPrice !== null
//                         ? formatNumber(
//                             item.askPrice -
//                               item.bidPrice,
//                             2
//                           )
//                         : "--"}
//                     </p>
//                   </div>

//                   <div className="rounded-2xl bg-slate-950/50 p-3">
//                     <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
//                       Bid
//                     </p>
//                     <p className="mt-2 text-lg font-medium text-white">
//                       {item.bidPrice !== null
//                         ? formatNumber(
//                             item.bidPrice,
//                             2
//                           )
//                         : "--"}
//                     </p>
//                   </div>

//                   <div className="rounded-2xl bg-slate-950/50 p-3">
//                     <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
//                       Ask
//                     </p>
//                     <p className="mt-2 text-lg font-medium text-white">
//                       {item.askPrice !== null
//                         ? formatNumber(
//                             item.askPrice,
//                             2
//                           )
//                         : "--"}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/45 p-3">
//                   <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
//                     Raw field payload
//                   </p>
//                   <div className="mt-3 grid gap-2 sm:grid-cols-2">
//                     {Object.entries(
//                       item.rawFields || {}
//                     ).map(([field, value]) => (
//                       <div
//                         key={field}
//                         className="rounded-xl bg-white/5 px-3 py-2"
//                       >
//                         <p className="text-xs text-slate-500">
//                           {marketState
//                             .fieldLabels?.[
//                             field
//                           ] || `Field ${field}`}
//                         </p>
//                         <p className="mt-1 text-sm text-white">
//                           {String(value ?? "--")}
//                         </p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </article>
//             ))}
//           </div>
//         ) : (
//           <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-white/4 px-5 py-10 text-center">
//             <p className="text-base font-medium text-white">
//               No market snapshots yet
//             </p>
//             <p className="mt-2 text-sm text-slate-400">
//               Load the default watchlist or enter custom symbols to pull market data.
//             </p>
//           </div>
//         )}
//       </section>
//     </>
//   );
// };

// export default Market;


// =============================== New Page ==============================

// import { useEffect, useMemo, useRef, useState } from "react";
// import LoadMore from "@/components/LoadMore";
// import MarketCard from "@/components/market/MarketCard";
// import MarketCardSkeleton from "@/components/market/MarketCardSkeleton";
// import NoRecordFound from "@/components/NoRecordFound";
// import { useIbkrMarketsInfinite } from "@/services/market";

// export default function MarketList() {
//   const [filters, setFilters] = useState({
//     search: "",
//     quality: "all",
//   });

//   const [searchInput, setSearchInput] = useState("");
//   const [isTyping, setIsTyping] = useState(false);

//   const filtersMemo = useMemo(() => filters, [filters]);
//   const [data, setData] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [hasNextPage, setHasNextPage] = useState(false);
//   const [limit, setLimit] = useState(16);
//   const [skip, setSkip] = useState(0);
//   const loadMoreRef = useRef < HTMLDivElement > (null);

//   useEffect(() => {
//     fetchData();
//   }, [skip, limit]);


//   const fetchData = async () => {
//     try {
//       setIsLoading(true);
//       const res = await useIbkrMarketsInfinite(skip, limit);
//       console.log(res?.data?.results, "market summary data");
//       setData(res?.data?.results);
//       setHasNextPage(res?.data?.hasMore);
//     } catch (error) {
//       console.log(error);
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   /* ---------- Infinite Scroll ---------- */


//   const applySearch = () => {
//     setFilters((f) => ({
//       ...f,
//       search: searchInput.trim(),
//     }));
//     setIsTyping(false);
//   };

//   const showEmpty = !isLoading && data.length === 0;

//   return (
//     <div className="container mx-auto mt-2 mb-7.5">

//       {/* ---------- SEARCH BOX ---------- */}
//       <div className="mb-5 flex justify-between">
//         <div>
//           <div className="text-4xl font-bold">
//             IBKR
//           </div>
//           <div className="text-gray-400">
//             Explore Real-Time Market Insights
//           </div>
//         </div>
//         <div className="relative w-full md:w-75">
//           <input
//             type="text"
//             value={searchInput}
//             placeholder="Search markets..."
//             onChange={(e) => {
//               setSearchInput(e.target.value);
//               setIsTyping(true);
//             }}
//             onBlur={applySearch}
//             onKeyDown={(e) => e.key === "Enter" && applySearch()}
//             className="w-full pl-10 pr-9 h-11.25 rounded-xl border border-gray-300
//             bg-white shadow-sm focus:outline-none focus:ring-2
//             focus:ring-blue-400 text-gray-900"
//           />

//           {/* Search Icon / Typing Indicator */}
//           {isTyping ? (
//             <span className="absolute left-3 top-2 text-gray-400">
//               ⌨️
//             </span>
//           ) : (
//             <span className="absolute left-3 top-3 text-gray-400">
//               🔍
//             </span>
//           )}

//           {/* CLEAR BUTTON */}
//           {searchInput && (
//             <button
//               onClick={() => {
//                 setSearchInput("");
//                 setFilters((f) => ({ ...f, search: "" }));
//                 setIsTyping(false);
//               }}
//               className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
//             >
//               ❌
//             </button>
//           )}
//         </div>
//       </div>

//       {/* ---------- EMPTY STATE ---------- */}
//       {showEmpty && <NoRecordFound onAction={fetchData} />}

//       {/* ---------- GRID ---------- */}
//       <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

//         {/* Skeletons */}
//         {isLoading &&
//           Array.from({ length: 12 }).map((_, i) => (
//             <MarketCardSkeleton key={`skeleton-${i}`} />
//           ))}

//         {/* Cards */}
//         {data.map((row, index) => (
//           <MarketCard key={`${row.con_id}-${index}`} market={row} />
//         ))}
//       </div>

//       {/* ---------- LOAD MORE ---------- */}
//       {/* {!showEmpty && (
//         <div ref={loadMoreRef} className="h-16 my-6 flex justify-center items-center">
//           {isFetchingNextPage && (
//             <LoadMore />
//           )}
//         </div>
//       )} */}
//     </div>
//   );
// }


//  ======================= New Code with Infinite Scroll ====================
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import LoadMore from "@/components/LoadMore";
import MarketCard from "@/components/market/MarketCard";
import MarketCardSkeleton from "@/components/market/MarketCardSkeleton";
import NoRecordFound from "@/components/NoRecordFound";
import { useIbkrMarketsInfinite } from "@/services/market";

export default function MarketList() {

  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  const limit = 16;
  const [skip, setSkip] = useState(0);

  const loadMoreRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Perform search when debounced value changes
  useEffect(() => {
    setData([]);
    setSkip(0);
    if (!debouncedQuery){
      fetchData(debouncedQuery);
      return;
    } 

    fetchData(debouncedQuery);
  }, [debouncedQuery]);


  const fetchData = useCallback(async (search="") => {
    try {
      setIsLoading(true);

      const res = await useIbkrMarketsInfinite(skip, limit, search);

      setData((prev) =>
        skip === 0
          ? res?.data?.results || []
          : [...prev, ...(res?.data?.results || [])]
      );

      setHasNextPage(res?.data?.hasMore || false);
    } finally {
      setIsLoading(false);
    }
  }, [skip, limit]);

  /* Initial + Pagination Fetch */
  useEffect(() => {
    fetchData(debouncedQuery);
  }, [fetchData]);

  /* Reset pagination when filters change */
  // useEffect(() => {
  //   setSkip(0);
  //   setData([]);
  // }, []);

  /* Infinite Scroll Observer */
  useEffect(() => {
    const target = loadMoreRef.current;

    console.log(target, "target log");


    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          hasNextPage &&
          !isLoading
        ) {
          console.log(entry.isIntersecting, "isIntersecting");

          setSkip((prev) => prev + limit);
        }
      },
      {
        threshold: 0.3,
      }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [hasNextPage, isLoading, limit]);

  const clearSearch = () => {
    setSearchInput("");
  }

  const showEmpty = !isLoading && data.length === 0;

  return (
    <div className="container mx-auto mt-2 mb-7.5">
      {/* Header */}
      <div className="mb-5 lg:flex lg:justify-between">
        <div>
          <div className="lg:text-5xl text-3xl font-bold">IBKR</div>
          <div className="text-gray-400 lg:text-base text-sm">
            Explore Real-Time Market Insights
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-75 lg:mt-0 mt-5">
          <input
            type="text"
            value={searchInput}
            placeholder="Search markets..."
            onChange={(e) => {
              setSearchInput(e.target.value);
            }}
            // onBlur={applySearch}
            // onKeyDown={(e) =>
            //   e.key === "Enter" && applySearch()
            // }
            className="w-full pl-10 pr-9 h-11.25 rounded-xl border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
          />

          <span className="absolute left-3 top-3 text-gray-400">
            🔍
          </span>

          {searchInput && (
            <button
              onClick={clearSearch}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
            >
              ❌
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {showEmpty && <NoRecordFound onAction={fetchData} />}

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {/* Initial Loading Skeletons */}
        {isLoading &&
          skip === 0 &&
          Array.from({ length: 12 }).map((_, i) => (
            <MarketCardSkeleton key={i} />
          ))}

        {/* Cards */}
        {data.map((row, index) => (
          <MarketCard
            key={`${row.con_id}-${index}`}
            market={row}
          />
        ))}
      </div>

      {/* Infinite Scroll Trigger */}
      {!showEmpty && (
        <div
          ref={loadMoreRef}
          className="h-20 flex justify-center items-center my-6"
        >
          {isLoading && skip > 0 && <LoadMore />}

          {!hasNextPage && data.length > 0 && (
            <span className="text-sm text-gray-400">
              No more records
            </span>
          )}
        </div>
      )}
    </div>
  );
}