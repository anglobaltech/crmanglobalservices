export default function Badge({ label, className = "", colorClass = "bg-gray-100 text-gray-600" }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${colorClass} ${className}`}
    >
      {label}
    </span>
  );
}
