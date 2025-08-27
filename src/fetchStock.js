export const fetchLTP = async (symbol) => {
  try {
    const res = await fetch(`http://localhost:5000/stock/${symbol}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("LTP fetch failed:", err);
    return null;
  }
};
