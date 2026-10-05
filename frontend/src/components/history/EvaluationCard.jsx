import React from "react";

const EvaluationCard = ({ evaluation, onViewDetails }) => {
  const risk = evaluation.hallucination_risk;

  const riskStyle =
    risk === "HIGH"
      ? "text-red-400 bg-red-400/10 border-red-400/20"
      : risk === "MEDIUM"
      ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
      : "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        {/* Evaluation Information */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-cyan-400">
              Evaluation #{evaluation.id}
            </span>

            <span className="rounded-md border border-slate-800 bg-slate-950 px-2 py-1 text-[10px] text-slate-500">
              {evaluation.evaluation_type}
            </span>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            {evaluation.question}
          </p>

          {/* Generation Model */}
          <div className="mt-3">
            <p className="text-[10px] uppercase tracking-wider text-slate-600">
              Generation
            </p>

            <p className="mt-1 text-xs text-slate-400">
              <span className="text-cyan-400">
                {evaluation.generation_provider || "Unknown"}
              </span>
              {" — "}
              {evaluation.generation_model || "Unknown"}
            </p>
          </div>

          {/* Judge Model */}
          <div className="mt-2">
            <p className="text-[10px] uppercase tracking-wider text-slate-600">
              Judge
            </p>

            <p className="mt-1 text-xs text-slate-400">
              <span className="text-purple-400">
                {evaluation.judge_provider || "Unknown"}
              </span>
              {" — "}
              {evaluation.judge_model || "Unknown"}
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[430px]">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-600">
              Correctness
            </p>

            <p className="mt-1 text-sm font-semibold text-white">
              {evaluation.correctness_score ?? 0}
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-600">
              Relevance
            </p>

            <p className="mt-1 text-sm font-semibold text-white">
              {evaluation.relevance_score ?? 0}
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-600">
              Faithfulness
            </p>

            <p className="mt-1 text-sm font-semibold text-white">
              {evaluation.faithfulness_score ?? 0}
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-600">
              Risk
            </p>

            <span
              className={`mt-1 inline-flex rounded-lg border px-2 py-1 text-[10px] font-semibold ${riskStyle}`}
            >
              {risk || "UNKNOWN"}
            </span>
          </div>
        </div>

        {/* Details Button */}
        <button
          onClick={() => onViewDetails(evaluation.id)}
          className="shrink-0 rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-medium text-cyan-400 transition hover:bg-cyan-400/20"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default EvaluationCard;