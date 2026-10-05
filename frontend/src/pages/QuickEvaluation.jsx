import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

function QuickEvaluation() {
  const [question, setQuestion] = useState("");
  const [context, setContext] = useState("");
  const [referenceAnswer, setReferenceAnswer] = useState("");

  const [providers, setProviders] = useState({});

  const [generationProvider, setGenerationProvider] =
    useState("openai");

  const [generationModel, setGenerationModel] =
    useState("gpt-4.1-mini");

  const [generationApiKey, setGenerationApiKey] = useState("");

  const [judgeProvider, setJudgeProvider] =
    useState("openai");

  const [judgeModel, setJudgeModel] =
    useState("gpt-4.1-mini");

  const [judgeApiKey, setJudgeApiKey] = useState("");

  const [modelsLoading, setModelsLoading] = useState(true);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await axios.get(
          "https://llm-evaluation-platform-6v8t.onrender.com/api/models/"
        );

        setProviders(response.data);

        const openaiModels =
          response.data.openai?.models || [];

        if (openaiModels.length > 0) {
          setGenerationModel(openaiModels[0]);
          setJudgeModel(openaiModels[0]);
        }
      } catch (error) {
        console.error("Failed to load models:", error);
      } finally {
        setModelsLoading(false);
      }
    };

    fetchProviders();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    const token = localStorage.getItem("access_token");

    try {
      const response = await axios.post(
        "https://llm-evaluation-platform-6v8t.onrender.com/api/evaluate/quick",
        {
          question,
          context,
          reference_answer: referenceAnswer,
          generation_provider: generationProvider,
          generation_model: generationModel,
          generation_api_key: generationApiKey,
          judge_provider: judgeProvider,
          judge_model: judgeModel,
          judge_api_key: judgeApiKey,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResult(response.data);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Evaluation failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const radarData = useMemo(() => {
    if (!result?.evaluation) return [];

    return [
      {
        metric: "Correctness",
        score: result.evaluation.correctness,
      },
      {
        metric: "Relevance",
        score: result.evaluation.relevance,
      },
      {
        metric: "Faithfulness",
        score: result.evaluation.faithfulness,
      },
    ];
  }, [result]);

  const claimStats = useMemo(() => {
    if (!result?.hallucination) {
      return {
        total: 0,
        supported: 0,
        unsupported: 0,
        contradicted: 0,
      };
    }

    return {
      total: result.hallucination.total_claims || 0,
      supported: result.hallucination.supported || 0,
      unsupported: result.hallucination.unsupported || 0,
      contradicted: result.hallucination.contradicted || 0,
    };
  }, [result]);

  /*
   * Token / Cost helpers
   * Backend already returns these values.
   * Safe fallbacks are used in case an older response
   * does not contain one of the fields.
   */
  const usageStats = useMemo(() => {
    if (!result) {
      return {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        estimatedCost: 0,
      };
    }

    return {
      inputTokens: Number(result.input_tokens || 0),
      outputTokens: Number(result.output_tokens || 0),
      totalTokens: Number(
        result.total_tokens ||
          (Number(result.input_tokens || 0) +
            Number(result.output_tokens || 0))
      ),
      estimatedCost: Number(result.estimated_cost || 0),
    };
  }, [result]);

  const getStatusStyle = (status) => {
    if (status === "SUPPORTED") {
      return {
        badge:
          "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
        icon: "✓",
      };
    }

    if (status === "CONTRADICTED") {
      return {
        badge:
          "border-red-400/30 bg-red-400/10 text-red-300",
        icon: "×",
      };
    }

    return {
      badge:
        "border-amber-400/30 bg-amber-400/10 text-amber-300",
      icon: "!",
    };
  };

  const getRiskStyle = (risk) => {
    if (risk === "LOW") {
      return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
    }

    if (risk === "MEDIUM") {
      return "border-amber-400/30 bg-amber-400/10 text-amber-300";
    }

    return "border-red-400/30 bg-red-400/10 text-red-300";
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] text-white">

      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(56,189,248,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.12) 1px, transparent 1px)",
            backgroundSize: "45px 45px",
          }}
        />

        <motion.div
          animate={{
            opacity: [0.15, 0.3, 0.15],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-[-180px] top-[-180px] h-[500px] w-[500px] rounded-full bg-cyan-500/20 blur-[120px]"
        />

        <motion.div
          animate={{
            opacity: [0.1, 0.25, 0.1],
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[-220px] right-[-150px] h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[130px]"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">

            <div className="flex items-center gap-3">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10">
                <div className="absolute inset-0 animate-pulse rounded-xl bg-cyan-400/10 blur-md" />
                <span className="relative text-xl">✦</span>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.3em] text-cyan-300">
                  AI Evaluation Lab
                </p>

                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  LLM Evaluation Engine
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>

              <span className="text-xs font-medium uppercase tracking-wider text-emerald-300">
                System Ready
              </span>
            </div>
          </div>

          <p className="max-w-2xl text-sm leading-6 text-slate-400">
            Evaluate LLM responses for correctness, relevance,
            faithfulness and hallucination risk using evidence-based
            claim verification.
          </p>
        </motion.header>

        {/* Input Section */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_0.8fr]"
        >

          {/* Evaluation Input */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl">

            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
                01
              </div>

              <div>
                <h2 className="font-semibold">
                  Evaluation Input
                </h2>

                <p className="text-xs text-slate-500">
                  Define what the model should answer
                </p>
              </div>
            </div>

            {/* Question */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Question
              </label>

              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What would you like the model to answer?"
                rows="4"
                required
                className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
              />
            </div>

            {/* Context */}
            <div className="mb-5">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">
                  Trusted Evidence / Context
                </label>

                <span className="text-[10px] uppercase tracking-wider text-cyan-400/60">
                  BM25 Source
                </span>
              </div>

              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Paste trusted information that should be used to verify factual claims..."
                rows="7"
                required
                className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
              />
            </div>

            {/* Reference */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Reference Answer
              </label>

              <textarea
                value={referenceAnswer}
                onChange={(e) =>
                  setReferenceAnswer(e.target.value)
                }
                placeholder="Enter the expected/reference answer..."
                rows="5"
                required
                className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
              />
            </div>
          </div>

          {/* Model Configuration */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl">

            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-400/10 text-purple-300">
                02
              </div>

              <div>
                <h2 className="font-semibold">
                  Model Configuration
                </h2>

                <p className="text-xs text-slate-500">
                  Configure generation and judging
                </p>
              </div>
            </div>

            {/* Generation */}
            <div className="mb-6 rounded-xl border border-cyan-400/10 bg-cyan-400/[0.03] p-4">

              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-cyan-200">
                    Generation Model
                  </p>

                  <p className="text-[11px] text-slate-500">
                    Produces the answer
                  </p>
                </div>

                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-cyan-300">
                  Generator
                </span>
              </div>

              <select
                value={generationProvider}
                onChange={(e) => {
                  const selectedProvider = e.target.value;
                  setGenerationProvider(selectedProvider);
                }}
                disabled={modelsLoading}
                className="mb-3 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50"
              >
                {Object.entries(providers).map(
                  ([providerId, provider]) => (
                    <option
                      key={providerId}
                      value={providerId}
                      className="bg-slate-900"
                    >
                      {provider.name}
                    </option>
                  )
                )}
              </select>
              <input type="text" value={generationModel} onChange={(e) => setGenerationModel(e.target.value)} placeholder="Enter generation model name" required className="mb-3 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
              />

              <input
                type="password"
                value={generationApiKey}
                onChange={(e) =>
                  setGenerationApiKey(e.target.value)
                }
                placeholder="Enter generation API key"
                required
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
              />
            </div>

            {/* Judge */}
            <div className="mb-6 rounded-xl border border-purple-400/10 bg-purple-400/[0.03] p-4">

              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-purple-200">
                    Judge Model
                  </p>

                  <p className="text-[11px] text-slate-500">
                    Evaluates the generated response
                  </p>
                </div>

                <span className="rounded-full border border-purple-400/20 bg-purple-400/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-purple-300">
                  Evaluator
                </span>
              </div>

              <select
                value={judgeProvider}
                onChange={(e) => {
                  const selectedProvider = e.target.value;
                  setJudgeProvider(selectedProvider);
                }}
                disabled={modelsLoading}
                className="mb-3 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-400/50"
              >
                {Object.entries(providers).map(
                  ([providerId, provider]) => (
                    <option
                      key={providerId}
                      value={providerId}
                      className="bg-slate-900"
                    >
                      {provider.name}
                    </option>
                  )
                )}
              </select>
              <input type="text" value={judgeModel} onChange={(e) => setJudgeModel(e.target.value)} placeholder="Enter judge model name" required className="mb-3 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-purple-400/50"
              />

              <input
                type="password"
                value={judgeApiKey}
                onChange={(e) =>
                  setJudgeApiKey(e.target.value)
                }
                placeholder="Enter judge API key"
                required
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-purple-400/50"
              />
            </div>

            {/* Run button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.01 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              className="group relative w-full overflow-hidden rounded-xl border border-cyan-300/30 bg-gradient-to-r from-cyan-500/90 to-blue-600/90 px-6 py-4 font-semibold text-white shadow-lg shadow-cyan-500/10 transition hover:shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {!loading && (
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              )}

              <span className="relative flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Running AI Evaluation...
                  </>
                ) : (
                  <>
                    <span>✦</span>
                    Run Evaluation
                    <span>→</span>
                  </>
                )}
              </span>
            </motion.button>

            <p className="mt-3 text-center text-[10px] uppercase tracking-widest text-slate-600">
              Keys are sent with the evaluation request
            </p>
          </div>
        </motion.form>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300"
            >
              <strong>Evaluation Error:</strong> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading visualization */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 overflow-hidden rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.03] p-5"
            >
              <div className="flex items-center gap-4">

                <div className="relative h-12 w-12">
                  <div className="absolute inset-0 animate-ping rounded-full border border-cyan-400/30" />
                  <div className="absolute inset-2 rounded-full border border-cyan-400/50" />
                  <div className="absolute inset-4 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-cyan-200">
                    AI Evaluation Pipeline Running
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Generating → extracting claims → retrieving evidence
                    → verifying → scoring
                  </p>

                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{
                        duration: 1.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="h-full w-1/3 rounded-full bg-cyan-400"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-12"
            >

              {/* Results heading */}
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="mb-1 text-xs uppercase tracking-[0.3em] text-cyan-400">
                    Analysis Complete
                  </p>

                  <h2 className="text-3xl font-bold">
                    Evaluation Results
                  </h2>
                </div>

                <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-slate-400">
                  {claimStats.total} factual claims analyzed
                </div>
              </div>

              {/* Score cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <ScoreCard
                  label="Correctness"
                  value={result.evaluation.correctness}
                  description="Match with reference"
                  accent="cyan"
                />

                <ScoreCard
                  label="Relevance"
                  value={result.evaluation.relevance}
                  description="Answers the question"
                  accent="blue"
                />

                <ScoreCard
                  label="Faithfulness"
                  value={result.evaluation.faithfulness}
                  description="Supported by context"
                  accent="purple"
                />

                <div
                  className={`rounded-2xl border p-5 ${getRiskStyle(
                    result.hallucination.risk
                  )}`}
                >
                  <p className="text-xs uppercase tracking-wider opacity-70">
                    Hallucination Risk
                  </p>

                  <p className="mt-3 text-3xl font-bold">
                    {result.hallucination.risk}
                  </p>

                  <p className="mt-2 text-xs opacity-60">
                    {result.hallucination.hallucination_rate}% problematic claims
                  </p>
                </div>

              </div>

              {/* Usage & Cost */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl">

                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">
                      Usage & Cost
                    </p>

                    <h3 className="mt-1 text-lg font-semibold">
                      Token Consumption
                    </h3>
                  </div>

                  <div className="rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 text-[10px] uppercase tracking-wider text-emerald-300">
                    Per Evaluation
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                  {/* Input Tokens */}
                  <UsageCard
                    label="Input Tokens"
                    value={usageStats.inputTokens.toLocaleString()}
                    description="Tokens sent to models"
                    icon="↓"
                    accent="cyan"
                  />

                  {/* Output Tokens */}
                  <UsageCard
                    label="Output Tokens"
                    value={usageStats.outputTokens.toLocaleString()}
                    description="Tokens generated"
                    icon="↑"
                    accent="purple"
                  />

                  {/* Total Tokens */}
                  <UsageCard
                    label="Total Tokens"
                    value={usageStats.totalTokens.toLocaleString()}
                    description="Complete evaluation usage"
                    icon="Σ"
                    accent="blue"
                  />

                  {/* Estimated Cost */}
                  <UsageCard
                    label="Estimated Cost"
                    value={`$${usageStats.estimatedCost.toFixed(6)}`}
                    description="Based on configured pricing"
                    icon="$"
                    accent="emerald"
                  />

                </div>

                {/* Model information */}
                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">

                  <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/[0.03] p-4">
                    <p className="text-[10px] uppercase tracking-wider text-cyan-400/70">
                      Generation
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-md border border-white/10 bg-black/20 px-2.5 py-1 text-xs text-slate-400">
                        {result.generation_provider ||
                          generationProvider}
                      </span>

                      <span className="text-sm font-medium text-slate-200">
                        {result.generation_model ||
                          generationModel}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-purple-400/10 bg-purple-400/[0.03] p-4">
                    <p className="text-[10px] uppercase tracking-wider text-purple-400/70">
                      Judge
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-md border border-white/10 bg-black/20 px-2.5 py-1 text-xs text-slate-400">
                        {result.judge_provider ||
                          judgeProvider}
                      </span>

                      <span className="text-sm font-medium text-slate-200">
                        {result.judge_model ||
                          judgeModel}
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Chart + summary */}
              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

                {/* Radar */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">

                  <div className="mb-4">
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Performance Profile
                    </p>

                    <h3 className="mt-1 text-lg font-semibold">
                      Evaluation Metrics
                    </h3>
                  </div>

                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="rgba(148,163,184,0.18)" />

                        <PolarAngleAxis
                          dataKey="metric"
                          tick={{
                            fill: "#94a3b8",
                            fontSize: 12,
                          }}
                        />

                        <PolarRadiusAxis
                          angle={90}
                          domain={[0, 100]}
                          tick={{
                            fill: "#64748b",
                            fontSize: 10,
                          }}
                        />

                        <Radar
                          name="Score"
                          dataKey="score"
                          stroke="#22d3ee"
                          fill="#06b6d4"
                          fillOpacity={0.18}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Analysis summary */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">

                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Claim Verification
                  </p>

                  <h3 className="mt-1 text-lg font-semibold">
                    Evidence Analysis
                  </h3>

                  <div className="mt-6 space-y-3">

                    <StatRow
                      label="Total Claims"
                      value={claimStats.total}
                      accent="text-white"
                    />

                    <StatRow
                      label="Supported"
                      value={claimStats.supported}
                      accent="text-emerald-300"
                    />

                    <StatRow
                      label="Unsupported"
                      value={claimStats.unsupported}
                      accent="text-amber-300"
                    />

                    <StatRow
                      label="Contradicted"
                      value={claimStats.contradicted}
                      accent="text-red-300"
                    />

                  </div>

                  <div className="mt-7 rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        Hallucination Rate
                      </span>

                      <span className="text-sm font-semibold text-white">
                        {result.hallucination.hallucination_rate}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(
                            result.hallucination.hallucination_rate,
                            100
                          )}%`,
                        }}
                        transition={{ duration: 1 }}
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-red-500"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Generated answer */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">

                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Model Output
                    </p>

                    <h3 className="mt-1 text-lg font-semibold">
                      Generated Answer
                    </h3>
                  </div>

                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] uppercase tracking-wider text-cyan-300">
                    {result.generation_model ||
                      generationModel}
                  </span>
                </div>

                <div className="rounded-xl border border-white/5 bg-black/20 p-5">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                    {result.generated_answer}
                  </p>
                </div>
              </div>

              {/* Claims */}
              <div className="mt-6">

                <div className="mb-5">
                  <p className="text-xs uppercase tracking-wider text-cyan-400">
                    Evidence Trace
                  </p>

                  <h3 className="mt-1 text-2xl font-bold">
                    Claim Analysis
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Each factual claim is checked against the trusted
                    evidence provided for this evaluation.
                  </p>
                </div>

                <div className="space-y-4">

                  {result.claim_evidence?.map((item, index) => {
                    const statusStyle = getStatusStyle(
                      item.verification?.status
                    );

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: Math.min(index * 0.04, 0.5),
                        }}
                        className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl"
                      >

                        <div className="flex flex-col gap-4">

                          <div className="flex items-start justify-between gap-4">

                            <div className="flex gap-3">

                              <div
                                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm ${statusStyle.badge}`}
                              >
                                {statusStyle.icon}
                              </div>

                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-600">
                                  Claim {index + 1}
                                </p>

                                <p className="mt-1 text-sm leading-6 text-slate-200">
                                  {item.claim}
                                </p>
                              </div>

                            </div>

                            <span
                              className={`shrink-0 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${statusStyle.badge}`}
                            >
                              {item.verification?.status}
                            </span>

                          </div>

                          {/* Evidence */}
                          <div className="ml-10 rounded-xl border border-white/5 bg-black/20 p-4">

                            <div className="mb-2 flex items-center gap-2">
                              <span className="text-xs font-semibold text-slate-400">
                                Retrieved Evidence
                              </span>

                              <span className="h-px flex-1 bg-white/5" />
                            </div>

                            {item.evidence?.length > 0 ? (
                              <div className="space-y-2">
                                {item.evidence.map(
                                  (evidenceItem, evidenceIndex) => (
                                    <div
                                      key={evidenceIndex}
                                      className="rounded-lg border border-white/5 bg-white/[0.02] p-3"
                                    >
                                      <p className="text-xs leading-5 text-slate-500">
                                        {evidenceItem.evidence}
                                      </p>

                                      <p className="mt-2 text-[10px] text-cyan-500/60">
                                        BM25 score:{" "}
                                        {Number(
                                          evidenceItem.score || 0
                                        ).toFixed(3)}
                                      </p>
                                    </div>
                                  )
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-600">
                                No evidence retrieved.
                              </p>
                            )}

                          </div>

                        </div>
                      </motion.div>
                    );
                  })}

                </div>
              </div>

            </motion.section>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="mt-16 border-t border-white/5 py-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-700">
            LLM Evaluation Platform • Evidence-Based AI Analysis
          </p>
        </footer>

      </div>
    </div>
  );
}

/* ----------------------------- */
/* Score Card                    */
/* ----------------------------- */

function ScoreCard({
  label,
  value,
  description,
  accent,
}) {
  const accentClasses = {
    cyan: "border-cyan-400/20 bg-cyan-400/[0.04] text-cyan-300",
    blue: "border-blue-400/20 bg-blue-400/[0.04] text-blue-300",
    purple:
      "border-purple-400/20 bg-purple-400/[0.04] text-purple-300",
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={`rounded-2xl border p-5 ${accentClasses[accent]}`}
    >
      <p className="text-xs uppercase tracking-wider opacity-60">
        {label}
      </p>

      <div className="mt-3 flex items-end gap-1">
        <span className="text-4xl font-bold text-white">
          {value}
        </span>

        <span className="mb-1 text-sm opacity-50">
          /100
        </span>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        {description}
      </p>

      <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9 }}
          className="h-full rounded-full bg-current"
        />
      </div>
    </motion.div>
  );
}

/* ----------------------------- */
/* Usage Card                    */
/* ----------------------------- */

function UsageCard({
  label,
  value,
  description,
  icon,
  accent,
}) {
  const accentClasses = {
    cyan: {
      wrapper: "border-cyan-400/15 bg-cyan-400/[0.03]",
      icon: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    },
    purple: {
      wrapper: "border-purple-400/15 bg-purple-400/[0.03]",
      icon: "border-purple-400/20 bg-purple-400/10 text-purple-300",
    },
    blue: {
      wrapper: "border-blue-400/15 bg-blue-400/[0.03]",
      icon: "border-blue-400/20 bg-blue-400/10 text-blue-300",
    },
    emerald: {
      wrapper: "border-emerald-400/15 bg-emerald-400/[0.03]",
      icon: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    },
  };

  const styles = accentClasses[accent] || accentClasses.cyan;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`rounded-xl border p-4 ${styles.wrapper}`}
    >
      <div className="flex items-start justify-between gap-3">

        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-xl font-bold text-white sm:text-2xl">
            {value}
          </p>
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm font-bold ${styles.icon}`}
        >
          {icon}
        </div>

      </div>

      <p className="mt-2 text-[11px] text-slate-500">
        {description}
      </p>
    </motion.div>
  );
}

/* ----------------------------- */
/* Stats Row                     */
/* ----------------------------- */

function StatRow({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-4 py-3">
      <span className="text-sm text-slate-400">
        {label}
      </span>

      <span className={`text-lg font-bold ${accent}`}>
        {value}
      </span>
    </div>
  );
}

export default QuickEvaluation;
