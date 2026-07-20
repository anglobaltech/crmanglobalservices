export default function ProgressBar({ progress = 0, label = "", showPercentage = true, colorClass = "bg-blue-600", successColorClass = "bg-emerald-500" }) {
  const isComplete = progress === 100;
  const activeColor = isComplete ? successColorClass : colorClass;

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-sm font-medium text-gray-600">{label}</span>}
          {showPercentage && <span className="text-sm font-bold text-gray-900">{progress}%</span>}
        </div>
      )}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${activeColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
