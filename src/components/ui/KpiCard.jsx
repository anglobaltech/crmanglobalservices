export default function KpiCard({ icon: Icon, label, value, colorClass = "bg-gray-100 text-gray-600" }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value ?? "—"}</p>
      </div>
    </div>
  );
}
