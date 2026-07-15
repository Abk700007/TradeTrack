function IndexCard({ name, value, change, percent }) {
  const isPositive = change >= 0;

  return (
    <div className="bg-white/10 text-white p-4 rounded-xl shadow-md backdrop-blur-md border border-white/20 w-full sm:w-1/2">
      <h2 className="text-lg font-semibold">{name}</h2>
      <p className="text-2xl font-bold">₹{value}</p>
      <p className={`text-sm ${isPositive ? "text-green-400" : "text-red-400"}`}>
        {isPositive ? "▲" : "▼"} ₹{Math.abs(change).toFixed(2)} ({Math.abs(percent).toFixed(2)}%)
      </p>
    </div>
  );
}

export default IndexCard;
