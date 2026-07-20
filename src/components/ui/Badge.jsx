export default function Badge({ label, className = "", colorClass = "bg-gray-100 text-gray-600" }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border ${colorClass} ${className}`}
    >
      {label}
    </span>
  );
}
