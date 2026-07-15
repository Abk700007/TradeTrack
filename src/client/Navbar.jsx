import { useState } from "react";
import { fetchLTP } from "../fetchStock.js"; // Adjust path if needed

function Navbar({ onSearch }) {
  const [input, setInput] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!input) return;

    const stockData = await fetchLTP(input); // fetch full data
    if (stockData && stockData.price) {
      onSearch(stockData); // ✅ send full data to App.jsx
      setInput("");
    } else {
      alert("Stock not found!");
    }
  };

  return (
    <nav className="flex justify-between items-center bg-blue-900 text-white p-4 shadow-md">
      <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-400">
  TradeTrack
</h1>

      <form onSubmit={handleSearch} className="flex items-center space-x-4">
        <input
          type="text"
          placeholder="Search stocks..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border px-3 py-1 rounded text-black"
        />
        <button type="submit" className="bg-blue-600 px-3 py-1 rounded">
          Search
        </button>
        <img
          src="https://i.pravatar.cc/30"
          alt="profile"
          className="rounded-full w-8 h-8"
        />
      </form>
    </nav>
  );
}
export default Navbar;
