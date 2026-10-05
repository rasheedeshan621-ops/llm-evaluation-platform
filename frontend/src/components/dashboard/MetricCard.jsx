import React from "react";

const MetricCard = ({ title, value, subtitle, icon }) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/10">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            {value}
          </p>

          {subtitle && (
            <p className="mt-2 text-xs text-slate-500">
              {subtitle}
            </p>
          )}
        </div>

        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-lg text-cyan-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
