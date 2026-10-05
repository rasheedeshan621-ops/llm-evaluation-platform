import React from "react";

const RecentEvaluations = ({ evaluations }) => {
  if (!evaluations || evaluations.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <p className="text-sm text-slate-400">
          No evaluations found.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">
          Recent Evaluations
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Latest evaluation results
        </p>
      </div>

      <div className="space-y-3">
        {evaluations.map((evaluation) => {
          const risk = evaluation.hallucination_risk;

          const riskStyle =
            risk === "HIGH"
              ? "text-red-400 bg-red-400/10 border-red-400/20"
              : risk === "MEDIUM"
              ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
              : "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";

          return (
            <div
              key={evaluation.id}
              className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Evaluation Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-cyan-400">
                      #{evaluation.id}
                    </span>

                    <span className="text-xs text-slate-600">
                      {evaluation.evaluation_type}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                    {evaluation.question}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Model:{" "}
                    <span className="text-slate-400">
                      {evaluation.generation_model}
                    </span>
                  </p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[420px]">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-600">
                      Correctness
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {evaluation.correctness ?? 0}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-600">
                      Relevance
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {evaluation.relevance ?? 0}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-600">
                      Faithfulness
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {evaluation.faithfulness ?? 0}
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentEvaluations;