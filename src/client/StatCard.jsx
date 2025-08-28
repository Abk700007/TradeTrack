function StatCard({ label, value, Icon }) {
  return (
    <div className="bg-white/10 text-white p-6 h-36 w-full sm:w-60 rounded-xl shadow-md backdrop-blur-md border border-white/20">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-md font-medium">{label}</h3>
          {Icon && <Icon className="w-6 h-6 text-white" />}
        </div>
        <p className="text-xl font-semibold break-words">{value}</p>
      </div>
    </div>
  );
}

export default StatCard;
