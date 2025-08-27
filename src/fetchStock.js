export const fetchLTP = async (symbol) => {
  try {
    // ✅ No hardcoded localhost
    const res = await fetch(`/api/stock/${symbol}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("LTP fetch failed:", err);
    return null;
  }
};
