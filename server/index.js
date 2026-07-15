// server/index.js (production-ready)
import express from "express";
import cors from "cors";
import yahooFinance from "yahoo-finance2";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());

app.get("/api/stock/:symbol", async (req, res) => {
  const { symbol } = req.params;

  // Add .NS for stocks, not indices
  const finalSymbol = symbol.startsWith("^") ? symbol.toUpperCase() : `${symbol}.NS`.toUpperCase();
  console.log("Fetching:", finalSymbol);

  try {
    const result = await yahooFinance.quote(finalSymbol);

    res.json({
      symbol: finalSymbol,
      price: result.regularMarketPrice,
      currency: result.currency,
      changePercent: result.regularMarketChangePercent,
      marketCap: result.marketCap,
    });
  } catch (error) {
    console.error("Full Error:", error);
    res.status(500).json({ error: error.message, cause: error.cause });
  }
});

// ---------- Serve React frontend in production ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the React build
app.use(express.static(path.join(__dirname, "../dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist", "index.html"));
});

// ---------- Start server ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
