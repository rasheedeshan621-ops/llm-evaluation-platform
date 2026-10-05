import React from "react";

const RiskCard = ({ title, value, description, type }) => {
  const styles = {
    HIGH: {
      text: "text-red-400",
      background: "bg-red-400/10",
      border: "border-red-400/20",
    },
    MEDIUM: {
      text: "text-yellow-400",
      background: "bg-yellow-400/10",
      border: "border-yellow-400/20",
    },
    LOW: {
      text: "text-emerald-400",
      background: "bg-emerald-400/10",
      border: "border-emerald-400/20",
    },
  };

  const currentStyle = styles[type] || styles.LOW;

  return (
    <div
      className={`rounded-2xl border ${currentStyle.border} ${currentStyle.background} p-5`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">
            {title}
          </p>

          <p
            className={`mt-2 text-3xl font-bold ${currentStyle.text}`}
          >
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl border ${currentStyle.border} ${currentStyle.text} text-lg`}
        >
          !
        </div>
      </div>
    </div>
  );
};

export default RiskCard;
