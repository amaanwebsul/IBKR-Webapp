import { useNavigate } from "react-router-dom";

export default function MarketCard({ market }) {
  const conid = market.con_id;
  const symbol = market.symbol;
  const summary = market.summary;

  const identity = summary?.identity;
  const pricing = summary?.pricing;
  const quality = summary?.marketQuality;
  const confidence = summary?.priceConfidence;

  if (!identity || !conid) return null;

  const navigate = useNavigate();

  return (
    <button
      // onClick={() => navigate(`/market/ibkr/${conid}?symbol=${encodeURIComponent(symbol)}`)}
      className="block cursor-pointer"
    >
      <div className="bg-white rounded-2xl p-4 border border-(--border) shadow-md h-full hover:shadow-lg transition">

        {/* TOP */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h2 className="font-semibold text-base text-cyan-900">
              {identity.symbol}
            </h2>
            <p className="text-sm text-green-600">
              {identity.name}
            </p>
          </div>

          <span
            className={`text-xs px-2 py-1 rounded-full ${
              quality.level === "tradable"
                ? "bg-green-100 text-green-700"
                : quality.level === "watch-only"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {quality.level}
          </span>
        </div>

        {/* PRICE */}
        <div className="flex justify-between items-center mt-2 text-black">
          <div>
            <p className="text-xs ">Last Price</p>
            <p className="font-bold">
              {pricing?.best != null ? `$${pricing.best}` : "—"}
            </p>
          </div>

          <div>
            <p className="text-xs">Confidence</p>
            <p className="font-bold">
              {confidence?.score ?? 0}%
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-3 text-xs text-black">
          Exchange: {identity.primaryExchange}
        </div>
      </div>
    </button>
  );
}
