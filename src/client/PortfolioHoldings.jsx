import { useState, useEffect } from "react";
import { fetchLTP } from "../fetchStock";

function PortfolioHoldings({ holdings, onBuyMore, onSell }) {
  const [activeTrade, setActiveTrade] = useState(null);
  const [updatedHoldings, setUpdatedHoldings] = useState(holdings);
  const [tradeQty, setTradeQty] = useState(1);

  useEffect(() => {
    const updateLTPs = async () => {
      const updated = await Promise.all(
        holdings.map(async (stock) => {
          const res = await fetchLTP(stock.symbol);
          return { ...stock, ltp: res?.price ?? stock.ltp };
        })
      );
      setUpdatedHoldings(updated);
    };

    updateLTPs();
    const interval = setInterval(updateLTPs, 5000);
    return () => clearInterval(interval);
  }, [holdings]);

  const handleTradeClick = (symbol) => {
    setActiveTrade(symbol);
    setTradeQty(1);
  };
  const closeTrade = () => setActiveTrade(null);

  return (
    <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 backdrop-blur-md text-white shadow-xl">
      <h2 className="text-2xl font-bold mb-6">📁 Portfolio Holdings</h2>

      {/* Responsive Table → Mobile cards, Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-white/80 border-b border-white/20 bg-white/5">
            <tr>
              <th className="text-left py-3 px-4">Stock</th>
              <th className="text-left py-3 px-4">Qty</th>
              <th className="text-left py-3 px-4">Avg Buy Price</th>
              <th className="text-left py-3 px-4">LTP</th>
              <th className="text-left py-3 px-4">Invested</th>
              <th className="text-left py-3 px-4">Current</th>
              <th className="text-left py-3 px-4">P/L</th>
              <th className="text-left py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {updatedHoldings.map((stock) => {
              const invested = stock.quantity * stock.buyPrice;
              const current = stock.quantity * stock.ltp;
              const pl = current - invested;
              const plColor = pl >= 0 ? "text-green-400" : "text-red-400";

              return (
                <tr
                  key={stock.symbol}
                  className="border-b text-lg border-white/10 hover:bg-white/10 transition"
                >
                  <td className="py-3 px-4 font-medium">{stock.symbol}</td>
                  <td className="py-3 px-4">{stock.quantity}</td>
                  <td className="py-3 px-4">₹{stock.buyPrice.toFixed(2)}</td>
                  <td className="py-3 px-4">₹{stock.ltp.toFixed(2)}</td>
                  <td className="py-3 px-4">₹{invested.toFixed(2)}</td>
                  <td className="py-3 px-4">₹{current.toFixed(2)}</td>
                  <td className={`py-3 px-4 font-semibold ${plColor}`}>
                    {pl >= 0 ? "+" : ""}₹{pl.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleTradeClick(stock.symbol)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs"
                    >
                      Trade
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-4">
        {updatedHoldings.map((stock) => {
          const invested = stock.quantity * stock.buyPrice;
          const current = stock.quantity * stock.ltp;
          const pl = current - invested;
          const plColor = pl >= 0 ? "text-green-400" : "text-red-400";

          return (
            <div
              key={stock.symbol}
              className="bg-white/10 p-4 rounded-xl border border-white/20"
            >
              <div className="flex justify-between">
                <span className="font-semibold">{stock.symbol}</span>
                <button
                  onClick={() => handleTradeClick(stock.symbol)}
                  className="bg-blue-600 px-3 py-1 rounded-lg text-xs"
                >
                  Trade
                </button>
              </div>
              <p>Qty: {stock.quantity}</p>
              <p>Avg Buy: ₹{stock.buyPrice.toFixed(2)}</p>
              <p>LTP: ₹{stock.ltp.toFixed(2)}</p>
              <p>Invested: ₹{invested.toFixed(2)}</p>
              <p>Current: ₹{current.toFixed(2)}</p>
              <p className={`font-semibold ${plColor}`}>
                P/L: {pl >= 0 ? "+" : ""}₹{pl.toFixed(2)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Trade Modal */}
      {activeTrade && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-2xl border border-white/20 w-[90%] max-w-md text-white">
            <h3 className="text-xl font-semibold mb-6 text-center">
              Trade: <span className="text-blue-400">{activeTrade}</span>
            </h3>
            <input
              type="number"
              min="1"
              value={tradeQty}
              onChange={(e) => setTradeQty(Number(e.target.value))}
              className="w-full p-2 mb-4 rounded bg-gray-800 border border-white/20 text-white"
            />
            <div className="flex justify-center gap-6">
              <button
                onClick={() => {
                  const stock = updatedHoldings.find((s) => s.symbol === activeTrade);
                  if (stock) onBuyMore(stock.symbol, tradeQty, stock.ltp);
                  closeTrade();
                }}
                className="bg-green-600 px-6 py-2 rounded-md"
              >
                Buy More
              </button>
              <button
                onClick={() => {
                  const stock = updatedHoldings.find((s) => s.symbol === activeTrade);
                  if (stock) onSell(stock.symbol, tradeQty, stock.ltp);
                  closeTrade();
                }}
                className="bg-red-600 px-6 py-2 rounded-md"
              >
                Sell
              </button>
            </div>
            <div className="flex justify-center mt-4">
              <button onClick={closeTrade} className="text-white/60 hover:text-white text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PortfolioHoldings;
