import { useState } from "react";
import { Calendar } from "lucide-react";

const presets = [
  { label: "7D", days: 7 },
  { label: "14D", days: 14 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
];

const DateRangeFilter = ({ onRangeChange }) => {
  const [activePreset, setActivePreset] = useState(2);

  const handlePreset = (index, days) => {
    setActivePreset(index);
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    onRangeChange(
      start.toISOString().split("T")[0],
      end.toISOString().split("T")[0]
    );
  };

  return (
    <div className="flex items-center justify-center md:justify-end gap-2">
      {/* Icon */}
      <Calendar
        size={14}
        className="text-slate-500"
      />
      {/* Preset Pills */}
      <div className="flex  gap-1 rounded-lg  p-1 ">
        {presets.map((preset, i) => (
          <button
            key={preset.label}
            onClick={() => handlePreset(i, preset.days)}
            className={[
              "px-3 py-1.5 text-xs font-mono rounded-md transition-all",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              activePreset === i
                ? "bg-gray-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white",
            ].join(" ")}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DateRangeFilter;
