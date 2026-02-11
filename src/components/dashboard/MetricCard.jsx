import { TrendingUp, TrendingDown } from "lucide-react";
import D3Sparkline from "./D3Sparkline";

const MetricCard = ({
  title,
  value,
  delta,
  suffix = "",
  sparklineData,
  sparklineColor,
}) => {
  const isPositive = delta >= 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
          {title}
        </span>

        <span
          className={`flex items-center gap-1 text-xs font-mono font-semibold ${
            isPositive ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {isPositive ? "+" : ""}
          {delta}%
        </span>
      </div>

      {/* Value */}
      <div className="text-2xl font-mono font-bold text-slate-900 text-left">
        {typeof value === "number" ? value.toLocaleString() : value}
        {suffix && (
          <span className="text-sm font-medium text-slate-500 ml-1">
            {suffix}
          </span>
        )}
      </div>

      {/* Sparkline */}
      {sparklineData && (
        <div className="mt-3 -mb-1">
          <D3Sparkline
            data={sparklineData}
            height={36}
            color={sparklineColor || (isPositive ? "#10b981" : "#ef4444")}
          />
        </div>
      )}
    </div>
  );
};

export default MetricCard;
