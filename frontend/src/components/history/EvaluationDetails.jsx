import React from "react";

const EvaluationDetails = ({ evaluation, onBack }) => {
  if (!evaluation) {
    return null;
  }

  const risk = evaluation.hallucination_risk;

  const riskStyle =
    risk === "HIGH"
      ? "text-red-400 bg-red-400/10 border-red-400/20"
      : risk === "MEDIUM"
      ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
      : "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">
            Evaluation Details
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Evaluation #{evaluation.id}
          </h2>
        </div>

        <button
          onClick={onBack}
          className="w-fit rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-400"
        >
          ← Back to History
        </button>
      </div>

      {/* Question */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <p className="text-[10px] uppercase tracking-wider text-slate-500">
          Question
        </p>

        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          {evaluation.question}
        </p>
      </div>

      {/* Model Information */}
      <div className="grid gap-6 sm:grid-cols-2">

        {/* Generation Model */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Generation Model
          </p>

          <p className="mt-3 text-sm font-medium text-cyan-400">
            {evaluation.generation_provider || "Unknown"}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {evaluation.generation_model || "Unknown"}
          </p>
        </div>

        {/* Judge Model */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Judge Model
          </p>

          <p className="mt-3 text-sm font-medium text-purple-400">
            {evaluation.judge_provider || "Unknown"}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {evaluation.judge_model || "Unknown"}
          </p>
        </div>

      </div>

      {/* Usage & Cost */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">
            Usage & Cost
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Token consumption and estimated evaluation cost
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Input Tokens */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-xs text-slate-500">
              Input Tokens
            </p>

            <p className="mt-2 text-2xl font-bold text-cyan-400">
              {Number(evaluation.input_tokens || 0).toLocaleString()}
            </p>

            <p className="mt-1 text-[10px] text-slate-600">
              Tokens sent to models
            </p>
          </div>

          {/* Output Tokens */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-xs text-slate-500">
              Output Tokens
            </p>

            <p className="mt-2 text-2xl font-bold text-purple-400">
              {Number(evaluation.output_tokens || 0).toLocaleString()}
            </p>

            <p className="mt-1 text-[10px] text-slate-600">
              Tokens generated
            </p>
          </div>

          {/* Total Tokens */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-xs text-slate-500">
              Total Tokens
            </p>

            <p className="mt-2 text-2xl font-bold text-white">
              {Number(
                evaluation.total_tokens ||
                  Number(evaluation.input_tokens || 0) +
                    Number(evaluation.output_tokens || 0)
              ).toLocaleString()}
            </p>

            <p className="mt-1 text-[10px] text-slate-600">
              Complete evaluation usage
            </p>
          </div>

          {/* Estimated Cost */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-xs text-slate-500">
              Estimated Cost
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-400">
              $
              {Number(evaluation.estimated_cost || 0).toFixed(6)}
            </p>

            <p className="mt-1 text-[10px] text-slate-600">
              Based on configured pricing
            </p>
          </div>

        </div>

        {/* Usage breakdown */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">

          <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-5">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">
              Generation
            </p>

            <p className="mt-2 text-sm font-medium text-cyan-400">
              {evaluation.generation_provider || "Unknown"}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {evaluation.generation_model || "Unknown"}
            </p>
          </div>

          <div className="rounded-2xl border border-purple-400/10 bg-purple-400/5 p-5">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">
              Judge
            </p>

            <p className="mt-2 text-sm font-medium text-purple-400">
              {evaluation.judge_provider || "Unknown"}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {evaluation.judge_model || "Unknown"}
            </p>
          </div>

        </div>
      </div>

      {/* Generated Answer */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <p className="text-[10px] uppercase tracking-wider text-slate-500">
          Generated Answer
        </p>

        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
          {evaluation.generated_answer || "No generated answer available."}
        </p>
      </div>

      {/* Reference Answer + Context */}
      <div className="grid gap-6 lg:grid-cols-2">

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Reference Answer
          </p>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-400">
            {evaluation.reference_answer ||
              "No reference answer available."}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Context
          </p>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-400">
            {evaluation.context || "No context available."}
          </p>
        </div>

      </div>

      {/* Scores */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">
            Evaluation Scores
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Overall quality metrics
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">

          {/* Correctness */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-xs text-slate-500">
              Correctness
            </p>

            <p className="mt-2 text-3xl font-bold text-cyan-400">
              {evaluation.correctness_score ?? 0}
            </p>
          </div>

          {/* Relevance */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-xs text-slate-500">
              Relevance
            </p>

            <p className="mt-2 text-3xl font-bold text-cyan-400">
              {evaluation.relevance_score ?? 0}
            </p>
          </div>

          {/* Faithfulness */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-xs text-slate-500">
              Faithfulness
            </p>

            <p className="mt-2 text-3xl font-bold text-cyan-400">
              {evaluation.faithfulness_score ?? 0}
            </p>
          </div>

        </div>
      </div>

      {/* Hallucination */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-xs text-slate-500">
              Hallucination Risk
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Claim-level verification result
            </p>
          </div>

          <span
            className={`w-fit rounded-lg border px-3 py-2 text-xs font-semibold ${riskStyle}`}
          >
            {risk || "UNKNOWN"}
          </span>

        </div>

      </div>

      {/* Claims */}
      {evaluation.claims && evaluation.claims.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">

          <div className="mb-5">
            <h3 className="text-lg font-semibold text-white">
              Claims & Evidence
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Claim-level grounding verification
            </p>
          </div>

          <div className="space-y-4">

            {evaluation.claims.map((claim, index) => {

              const status = claim.status || "UNSUPPORTED";

              const statusStyle =
                status === "SUPPORTED"
                  ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                  : status === "CONTRADICTED"
                  ? "text-red-400 bg-red-400/10 border-red-400/20"
                  : "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";

              return (
                <div
                  key={claim.id || index}
                  className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div className="flex gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-cyan-400/10 text-xs text-cyan-400">
                        {index + 1}
                      </div>

                      <p className="text-sm leading-relaxed text-slate-300">
                        {claim.claim}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-lg border px-2 py-1 text-[10px] font-semibold ${statusStyle}`}
                    >
                      {status}
                    </span>

                  </div>

                  {claim.evidence && (
                    <div className="mt-4">
                      <p className="text-[10px] uppercase tracking-wider text-slate-600">
                        Evidence
                      </p>

                      <p className="mt-2 text-xs leading-relaxed text-slate-400">
                        {claim.evidence}
                      </p>
                    </div>
                  )}

                </div>
              );
            })}

          </div>
        </div>
      )}

    </div>
  );
};

export default EvaluationDetails;
