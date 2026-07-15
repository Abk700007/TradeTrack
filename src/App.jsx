import { useState, useEffect } from "react";
import Navbar from "./client/Navbar";
import IndexCard from "./client/IndexCard";
import StatCard from "./client/StatCard";
import Watchlist from "./client/Watchlist";
import PortfolioHoldings from "./client/PortfolioHoldings";
import LandingPage from "./client/LandingPage";
import { Wallet, TrendingUp, BarChart2, ArrowUpRight } from "lucide-react";
import { fetchLTP } from "./fetchStock";

function App() {
  const [showLanding, setShowLanding] = useState(true);

  const [searchedStock, setSearchedStock] = useState(null);
  const [niftyData, setNiftyData] = useState({ value: 0, change: 0, percent: 0 });
  const [bankNiftyData, setBankNiftyData] = useState({ value: 0, change: 0, percent: 0 });

  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyShares, setBuyShares] = useState("");
  const [portfolio, setPortfolio] = useState([]);

  const INITIAL_WALLET = 100000;
  const [wallet, setWallet] = useState(INITIAL_WALLET);
  const [invested, setInvested] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  const [profitLoss, setProfitLoss] = useState(0);

  const handleStockSearch = async (stock) => {
    setSearchedStock(stock);
  };

  const handleBuyClick = () => setShowBuyModal(true);


   // 🔹 Buy More handler (adds shares to existing holding)
  const handleBuyMore = (symbol, quantity, price) => {
    setPortfolio((prev) => {
      const index = prev.findIndex((h) => h.symbol === symbol);
      if (index !== -1) {
        const updated = [...prev];
        const existing = updated[index];
        const newQty = existing.quantity + quantity;
        updated[index] = {
          ...existing,
          quantity: newQty,
          buyPrice:
            (existing.buyPrice * existing.quantity + price * quantity) /
            newQty, // weighted avg
        };
        return updated;
      }
      return prev; // shouldn't happen unless stock missing
    });

    setWallet((prev) => prev - quantity * price);
    setInvested((prev) => prev + quantity * price);
  };

  // 🔹 Sell handler (removes/reduces shares)
  const handleSell = (symbol, quantity, price) => {
    setPortfolio((prev) => {
      const index = prev.findIndex((h) => h.symbol === symbol);
      if (index !== -1) {
        const updated = [...prev];
        const existing = updated[index];
        const newQty = existing.quantity - quantity;
        if (newQty <= 0) {
          updated.splice(index, 1); // remove stock completely
        } else {
          updated[index] = { ...existing, quantity: newQty };
        }
        return updated;
      }
      return prev;
    });

    setWallet((prev) => prev + quantity * price); // add back money
    setInvested((prev) => prev - quantity * price); // reduce invested
  };


  const confirmBuy = () => {
    if (searchedStock && buyShares > 0) {
      const quantity = parseInt(buyShares);

      setPortfolio((prev) => {
        const symbol = searchedStock.symbol.replace(".NS", "");
        const existingIndex = prev.findIndex((h) => h.symbol === symbol);

        if (existingIndex !== -1) {
          // merge with existing stock
          const updated = [...prev];
          const existing = updated[existingIndex];
          const newQty = existing.quantity + quantity;

          updated[existingIndex] = {
            ...existing,
            quantity: newQty,
            buyPrice:
              (existing.buyPrice * existing.quantity + searchedStock.price * quantity) /
              newQty, // weighted average
          };
          return updated;
        } else {
          // add new stock
          return [
            ...prev,
            {
              symbol,
              quantity,
              buyPrice: searchedStock.price,
              ltp: searchedStock.price,
            },
          ];
        }
      });

      setWallet((prev) => prev - quantity * searchedStock.price);
      setInvested((prev) => prev + quantity * searchedStock.price);
      setBuyShares("");
      setShowBuyModal(false);
    }
  };

  // 🔄 Poll portfolio stocks for updated LTP every 5 seconds
  useEffect(() => {
    if (portfolio.length === 0) return;

    const fetchPortfolioLTP = async () => {
      let totalCurrent = 0;

      const updatedPortfolio = await Promise.all(
        portfolio.map(async (holding) => {
          const updated = await fetchLTP(holding.symbol);
          const ltp = updated?.price ?? holding.ltp;
          totalCurrent += ltp * holding.quantity;
          return { ...holding, ltp };
        })
      );

      setPortfolio(updatedPortfolio);
      setCurrentValue(totalCurrent);
      setProfitLoss(totalCurrent - invested);
    };

    fetchPortfolioLTP();
    const interval = setInterval(fetchPortfolioLTP, 5000);
    return () => clearInterval(interval);
  }, [invested, portfolio.length]);

  // 🔄 Real-time searched stock update
  useEffect(() => {
    if (!searchedStock?.symbol) return;
    const symbol = searchedStock.symbol.replace(".NS", "");
    const interval = setInterval(async () => {
      const updated = await fetchLTP(symbol);
      if (updated && updated.price != null) {
        setSearchedStock(updated);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [searchedStock?.symbol]);

  // 🔄 Real-time Nifty & Bank Nifty updates
  useEffect(() => {
    const fetchIndexData = async () => {
      const niftyRes = await fetchLTP("^NSEI");
      const bankNiftyRes = await fetchLTP("^NSEBANK");

      if (niftyRes?.price != null && niftyRes?.changePercent != null) {
        setNiftyData({
          value: niftyRes.price,
          change: niftyRes.price * (niftyRes.changePercent / 100),
          percent: niftyRes.changePercent,
        });
      }

      if (bankNiftyRes?.price != null && bankNiftyRes?.changePercent != null) {
        setBankNiftyData({
          value: bankNiftyRes.price,
          change: bankNiftyRes.price * (bankNiftyRes.changePercent / 100),
          percent: bankNiftyRes.changePercent,
        });
      }
    };

    fetchIndexData();
    const interval = setInterval(fetchIndexData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-sans">
      {showLanding ? (
        <LandingPage onLaunch={() => setShowLanding(false)} />
      ) : (
        <div className="bg-gradient-to-r from-[#192335] to-[#2c3f54] min-h-screen text-white">
          <Navbar onSearch={handleStockSearch} />

          <div className="mx-10 p-4 space-y-4">
            {/* Index Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <IndexCard
                name="Nifty 50"
                value={niftyData.value.toFixed(2)}
                change={niftyData.change.toFixed(2)}
                percent={niftyData.percent}
              />
              <IndexCard
                name="Bank Nifty"
                value={bankNiftyData.value.toFixed(2)}
                change={bankNiftyData.change.toFixed(2)}
                percent={bankNiftyData.percent}
              />
            </div>

            {/* Stat Cards */}
            <div className="my-10 mx-4 sm:mx-40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
              <StatCard label="Wallet" value={`₹${wallet.toFixed(2)}`} Icon={Wallet} />
              <StatCard label="Invested" value={`₹${invested.toFixed(2)}`} Icon={TrendingUp} />
              <StatCard label="Current Value" value={`₹${currentValue.toFixed(2)}`} Icon={BarChart2} />
              <StatCard
                label="Profit / Loss"
                value={`${profitLoss >= 0 ? "+" : "-"}₹${Math.abs(profitLoss).toFixed(2)}`}
                Icon={ArrowUpRight}
                className={profitLoss >= 0 ? "text-green-400" : "text-red-400"}
              />
            </div>

            {/* Searched Stock Display */}
            {searchedStock && (
              <div className="bg-white/10 p-4 rounded-xl border border-white/20 shadow-md">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold">{searchedStock.symbol.replace(".NS", "")}</h2>
                    <p>LTP: ₹{searchedStock.price}</p>
                    <p>Change %: {searchedStock.changePercent?.toFixed(2) ?? "N/A"}%</p>
                    <p>
                      Market Cap:{" "}
                      {searchedStock.marketCap
                        ? `₹${(searchedStock.marketCap / 1e7).toFixed(2)} Cr`
                        : "N/A"}
                    </p>
                  </div>
                  <button
                    onClick={handleBuyClick}
                    className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition"
                  >
                    Buy
                  </button>
                </div>
              </div>
            )}

            {/* Buy Modal */}
            {showBuyModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-gray-800 p-6 rounded-xl border border-white/20 w-[90%] max-w-sm text-white">
                  <h3 className="text-lg font-semibold text-center mb-4">
                    Buy {searchedStock?.symbol.replace(".NS", "")}
                  </h3>
                  <input
                    type="number"
                    value={buyShares}
                    onChange={(e) => setBuyShares(e.target.value)}
                    placeholder="Enter shares"
                    className="w-full p-2 rounded bg-gray-700 mb-4 text-white outline-none"
                  />
                  <div className="flex justify-between">
                    <button
                      onClick={confirmBuy}
                      className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
                    >
                      Confirm Buy
                    </button>
                    <button
                      onClick={() => setShowBuyModal(false)}
                      className="text-white/70 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <Watchlist />
           <PortfolioHoldings
        holdings={portfolio}
        onBuyMore={handleBuyMore}
        onSell={handleSell}
      />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
