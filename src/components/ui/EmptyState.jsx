export default function EmptyState({ icon: Icon, title, description, className = "py-24" }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      {Icon && (
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center">
          <Icon size={36} className="text-gray-300" />
        </div>
      )}
      <div className="text-center">
        <p className="font-semibold text-gray-700">{title}</p>
        {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
      </div>
    </div>
  );
}
