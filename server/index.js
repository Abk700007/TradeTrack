// server/index.js (ESM version)
import express from "express";
import cors from "cors";
import yahooFinance from "yahoo-finance2";

const app = express();
app.use(cors());

app.get("/stock/:symbol", async (req, res) => {
  const { symbol } = req.params;
  
  // Only add .NS for stocks, not indices
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

app.listen(5000, () => {
  console.log("✅ Backend running at http://localhost:5000");
});
