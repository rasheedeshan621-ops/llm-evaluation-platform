import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import EvaluationCard from "../components/history/EvaluationCard";
import EvaluationDetails from "../components/history/EvaluationDetails";

const History = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchHistory = async () => {
    const token = localStorage.getItem("access_token");

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "https://llm-evaluation-platform-6v8t.onrender.com/api/evaluate/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEvaluations(response.data);
    } catch (err) {
      console.error("History error:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load evaluation history."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchEvaluationDetails = async (evaluationId) => {
    const token = localStorage.getItem("access_token");

    try {
      setDetailsLoading(true);
      setError("");

      const response = await axios.get(
        `https://llm-evaluation-platform-6v8t.onrender.com/api/evaluate/${evaluationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSelectedEvaluation(response.data);
    } catch (err) {
      console.error("Evaluation details error:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load evaluation details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  /*
   * ============================================================
   * GROUP BENCHMARK EVALUATIONS
   * ============================================================
   *
   * One benchmark run creates 3 Evaluation records
   * because 3 models are evaluated.
   *
   * All 3 records share the same benchmark_run_id.
   *
   * Quick evaluations remain individual records.
   */

  const groupedHistory = useMemo(() => {
    const groups = [];
    const benchmarkGroups = new Map();

    evaluations.forEach((evaluation) => {
      /*
       * Quick evaluation
       * ----------------
       * Keep it as an individual history item.
       */
      if (
        evaluation.evaluation_type !== "benchmark" ||
        !evaluation.benchmark_run_id
      ) {
        groups.push({
          type: "single",
          evaluation,
        });

        return;
      }

      /*
       * Benchmark evaluation
       * --------------------
       * Group by benchmark_run_id.
       */
      const runId = evaluation.benchmark_run_id;

      if (!benchmarkGroups.has(runId)) {
        const group = {
          type: "benchmark",
          benchmark_run_id: runId,
          evaluations: [],
        };

        benchmarkGroups.set(runId, group);
        groups.push(group);
      }

      benchmarkGroups.get(runId).evaluations.push(evaluation);
    });

    return groups;
  }, [evaluations]);

  const handleBack = () => {
    setSelectedEvaluation(null);
    setError("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-sm text-cyan-400">
          Loading evaluation history...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3">
            <p className="text-sm text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* Details View */}
        {selectedEvaluation ? (
          <>
            {detailsLoading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <p className="text-sm text-cyan-400">
                  Loading evaluation details...
                </p>
              </div>
            ) : (
              <EvaluationDetails
                evaluation={selectedEvaluation}
                onBack={handleBack}
              />
            )}
          </>
        ) : (
          <>
            {/* Header */}
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">
                LLM Evaluation Platform
              </p>

              <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                Evaluation History
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Review previous evaluations and inspect detailed
                results.
              </p>
            </div>

            {/* Empty State */}
            {evaluations.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-10 text-center">
                <p className="text-sm text-slate-400">
                  No evaluations found.
                </p>

                <p className="mt-2 text-xs text-slate-600">
                  Run an evaluation to see it here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">

                {groupedHistory.map((item) => {

                  /*
                   * ==================================================
                   * NORMAL / QUICK EVALUATION
                   * ==================================================
                   */
                  if (item.type === "single") {
                    return (
                      <EvaluationCard
                        key={`evaluation-${item.evaluation.id}`}
                        evaluation={item.evaluation}
                        onViewDetails={fetchEvaluationDetails}
                      />
                    );
                  }

                  /*
                   * ==================================================
                   * BENCHMARK GROUP
                   * ==================================================
                   */
                  const benchmarkEvaluations =
                    item.evaluations;

                  const firstEvaluation =
                    benchmarkEvaluations[0];

                  return (
                    <div
                      key={`benchmark-${item.benchmark_run_id}`}
                      className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/10"
                    >

                      {/* Benchmark Header */}
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                        <div>
                          <div className="flex items-center gap-3">

                            <span className="rounded-full border border-purple-400/20 bg-purple-400/10 px-3 py-1 text-xs font-medium text-purple-300">
                              BENCHMARK
                            </span>

                            <span className="text-xs text-slate-500">
                              {benchmarkEvaluations.length} model
                              {benchmarkEvaluations.length !== 1
                                ? "s"
                                : ""}
                            </span>

                          </div>

                          <h2 className="mt-3 text-lg font-semibold text-white">
                            {firstEvaluation.question}
                          </h2>
                        </div>

                        {/* Benchmark ID */}
                        <div className="text-xs text-slate-600">
                          Run ID:{" "}
                          {item.benchmark_run_id.slice(0, 8)}
                        </div>

                      </div>

                      {/* Model Results */}
                      <div className="mt-5 grid gap-3 md:grid-cols-3">

                        {benchmarkEvaluations.map(
                          (evaluation) => (
                            <div
                              key={evaluation.id}
                              className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                            >

                              <div className="mb-3">
                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                  Generation
                                </p>

                                <p className="mt-1 text-sm font-medium text-white">
                                  {evaluation.generation_provider ||
                                    "Unknown"}
                                </p>

                                <p className="mt-1 break-all text-xs text-cyan-400">
                                  {evaluation.generation_model ||
                                    "Unknown model"}
                                </p>
                              </div>

                              <div className="grid grid-cols-3 gap-2">

                                <div>
                                  <p className="text-[10px] text-slate-500">
                                    Correctness
                                  </p>

                                  <p className="mt-1 text-lg font-bold text-white">
                                    {evaluation.correctness_score ??
                                      "-"}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-[10px] text-slate-500">
                                    Relevance
                                  </p>

                                  <p className="mt-1 text-lg font-bold text-white">
                                    {evaluation.relevance_score ??
                                      "-"}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-[10px] text-slate-500">
                                    Faithfulness
                                  </p>

                                  <p className="mt-1 text-lg font-bold text-white">
                                    {evaluation.faithfulness_score ??
                                      "-"}
                                  </p>
                                </div>

                              </div>

                              <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">

                                <div>
                                  <p className="text-[10px] text-slate-500">
                                    Risk
                                  </p>

                                  <p className="mt-1 text-xs font-semibold text-emerald-400">
                                    {evaluation.hallucination_risk ||
                                      "UNKNOWN"}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    fetchEvaluationDetails(
                                      evaluation.id
                                    )
                                  }
                                  className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-300 transition hover:bg-cyan-400/20"
                                >
                                  View Details
                                </button>

                              </div>

                            </div>
                          )
                        )}

                      </div>

                    </div>
                  );
                })}

              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default History;
