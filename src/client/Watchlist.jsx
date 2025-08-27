import { useState, useEffect } from "react";
import { Eye, ArrowRight } from "lucide-react";
import { fetchLTP } from "../fetchStock";

const stockSymbols = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ITC"];

function Watchlist() {
  const [stocks, setStocks] = useState([]); // Initial empty

  const fetchAll = async () => {
    const updatedStocks = await Promise.all(
      stockSymbols.map(async (sym) => {
        const prev = stocks.find((s) => s.symbol === sym);
        const data = await fetchLTP(sym);

        if (data && data.price != null && data.changePercent != null) {
          return {
            symbol: sym,
            price: data.price,
            changePercent: data.changePercent,
          };
        } else {
          // ❗️Return previous good data if fetch fails
          return prev || { symbol: sym, price: null, changePercent: null };
        }
      })
    );

    setStocks(updatedStocks);
  };

  useEffect(() => {
    fetchAll(); // Initial fetch
    const interval = setInterval(fetchAll, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [stocks]); // Optional: can use [] if you're sure of data flow

  return (
    <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="text-white" />
        <h2 className="text-white text-xl font-semibold">Watchlist</h2>
      </div>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide relative z-0">
        {stocks.map((stock, index) => (
          <div
            key={index}
            className="bg-white/10 text-white p-3 rounded-xl min-w-[150px] flex-shrink-0 hover:bg-white/20 transition"
          >
            <h3 className="text-md font-semibold">{stock.symbol}</h3>

            <p className="text-sm">
              LTP: ₹
              {stock.price != null ? stock.price.toFixed(2) : "Loading..."}
            </p>

            <p
              className={`text-sm ${
                stock.changePercent == null
                  ? "text-white/70"
                  : stock.changePercent >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {stock.changePercent != null
                ? `${stock.changePercent.toFixed(2)}%`
                : "Loading..."}
            </p>
          </div>
        ))}

        <div className="min-w-[80px] flex items-center justify-center">
          <div className="relative group inline-block">
            <ArrowRight className="text-white w-7 h-7 rounded-full bg-gray-700 cursor-pointer hover:bg-gray-900" />
            <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
              See Full
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Watchlist;
