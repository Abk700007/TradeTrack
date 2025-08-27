export const fetchLTP = async (symbol) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/stock/${symbol}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("LTP fetch failed:", err);
    return null;
  }
};
