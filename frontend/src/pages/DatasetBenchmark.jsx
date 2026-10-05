import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import ClaimsEvidence from "../components/benchmark/ClaimsEvidence";

const API_BASE_URL = "https://llm-evaluation-platform-6v8t.onrender.com";

export default function DatasetBenchmark() {
  const [dataset, setDataset] = useState(null);
  const [datasetId, setDatasetId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [models, setModels] = useState([
    { provider: "openai", model: "", api_key: "" },
    { provider: "openai", model: "", api_key: "" },
    { provider: "openai", model: "", api_key: "" },
  ]);

  const [judgeProvider, setJudgeProvider] = useState("openai");
  const [judgeModel, setJudgeModel] = useState("");
  const [judgeApiKey, setJudgeApiKey] = useState("");

  const [loading, setLoading] = useState(false);

  // Benchmark result
  const [benchmarkResult, setBenchmarkResult] = useState(null);

  const [providers, setProviders] = useState({});

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/models/`);
        const data = response.data || {};
        setProviders(data);

        const defaultProvider = Object.keys(data).includes("openai")
          ? "openai"
          : Object.keys(data)[0] || "openai";

        setModels((current) =>
          current.map((item) => {
            const provider = item.provider || defaultProvider;
            const providerModels = data[provider]?.models || [];

            return {
              ...item,
              provider,
              model: item.model || providerModels[0] || "",
            };
          })
        );

        setJudgeProvider(defaultProvider);
        setJudgeModel(data[defaultProvider]?.models?.[0] || "");
      } catch (error) {
        console.error("Failed to load providers:", error);
      }
    };

    loadProviders();
  }, []);

  const handleProviderChange = (index, provider) => {
    const updated = [...models];

    updated[index] = {
      ...updated[index],
      provider,
    };

    setModels(updated);
  };

  const handleJudgeProviderChange = (provider) => {
    setJudgeProvider(provider);
  };

  const handleModelChange = (index, field, value) => {
    const updated = [...models];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setModels(updated);
  };

  // -----------------------------
  // DATASET UPLOAD
  // -----------------------------

  const handleDatasetChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      alert("Please upload a CSV file.");
      return;
    }

    setDataset(file);
    setDatasetId(null);
    setBenchmarkResult(null);
    setUploading(true);

    const formData = new FormData();

    formData.append("file", file);

    try {
      const token = localStorage.getItem("access_token");

      const response = await axios.post(
        "https://llm-evaluation-platform-6v8t.onrender.com/api/datasets/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDatasetId(response.data.dataset_id);

      console.log(
        "Dataset uploaded successfully:",
        response.data
      );
    } catch (error) {
      console.error(
        "Dataset upload failed:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Dataset upload failed. Please try again."
      );

      setDataset(null);
      setDatasetId(null);
    } finally {
      setUploading(false);
    }
  };

  // -----------------------------
  // RUN BENCHMARK
  // -----------------------------

  const handleRunBenchmark = async () => {
    if (!datasetId) {
      alert("Please upload a dataset first.");
      return;
    }

    const incompleteModel = models.some(
      (item) =>
        !item.provider?.trim() ||
        !item.model?.trim() ||
        !item.api_key?.trim()
    );

    if (incompleteModel) {
      alert(
        "Please provide provider, model name and API key for all 3 models."
      );
      return;
    }

    if (
      !judgeProvider.trim() ||
      !judgeModel.trim() ||
      !judgeApiKey.trim()
    ) {
      alert(
        "Please provide judge provider, judge model and judge API key."
      );
      return;
    }

    setLoading(true);
    setBenchmarkResult(null);

    try {
      const payload = {
        dataset_id: datasetId,

        models: models.map((item) => ({
          provider: item.provider.trim(),
          model: item.model.trim(),
          api_key: item.api_key.trim(),
        })),

        judge_provider: judgeProvider.trim(),
        judge_model: judgeModel.trim(),

        judge_api_key: judgeApiKey.trim(),
      };

      console.log("Starting benchmark:", {
        dataset_id: payload.dataset_id,

        models: payload.models.map((item) => ({
          provider: item.provider,
          model: item.model,
          api_key: "***",
        })),

        judge_provider: payload.judge_provider,
        judge_model: payload.judge_model,

        judge_api_key: "***",
      });

      const token = localStorage.getItem("access_token");

      const response = await axios.post(
        "https://llm-evaluation-platform-6v8t.onrender.com/api/evaluate/compare",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Benchmark result:",
        response.data
      );

      setBenchmarkResult(response.data);

      alert(
        "Dataset benchmark completed successfully!"
      );
    } catch (error) {
      console.error(
        "Benchmark failed:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Benchmark failed. Please check your API keys and backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // HELPER FUNCTIONS
  // -----------------------------

  const calculateAverage = (
    modelsData,
    metric
  ) => {
    if (!modelsData?.length) return 0;

    const values = modelsData
      .map(
        (item) =>
          Number(
            item.evaluation?.[metric] || 0
          )
      );

    if (!values.length) return 0;

    const total = values.reduce(
      (sum, value) => sum + value,
      0
    );

    return (
      total / values.length
    ).toFixed(1);
  };

  const calculateTotal = (modelsData, field) => {
    if (!modelsData?.length) return 0;

    return modelsData.reduce((total, item) => {
      return total + Number(item?.[field] || 0);
    }, 0);
  };

  const calculateModelUsage = (modelIndex) => {
    const modelResults =
      benchmarkResult?.results
        ?.map((question) => question.models?.[modelIndex])
        .filter(Boolean) || [];

    return {
      inputTokens: calculateTotal(
        modelResults,
        "input_tokens"
      ),

      outputTokens: calculateTotal(
        modelResults,
        "output_tokens"
      ),

      totalTokens: calculateTotal(
        modelResults,
        "total_tokens"
      ),

      estimatedCost: modelResults.reduce(
        (total, item) =>
          total + Number(item?.estimated_cost || 0),
        0
      ),
    };
  };

  const calculateBenchmarkUsage = () => {
    const allModelResults =
      benchmarkResult?.results?.flatMap(
        (question) => question.models || []
      ) || [];

    return {
      inputTokens: calculateTotal(
        allModelResults,
        "input_tokens"
      ),

      outputTokens: calculateTotal(
        allModelResults,
        "output_tokens"
      ),

      totalTokens: calculateTotal(
        allModelResults,
        "total_tokens"
      ),

      estimatedCost: allModelResults.reduce(
        (total, item) =>
          total + Number(item?.estimated_cost || 0),
        0
      ),
    };
  };

  const getRiskClass = (risk) => {
    if (risk === "HIGH") {
      return "text-red-400 bg-red-400/10 border-red-400/20";
    }

    if (risk === "MEDIUM") {
      return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
    }

    return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
  };

  // -----------------------------
  // UI
  // -----------------------------

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-8">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <motion.div
          initial={{
            opacity: 0,
            y: -20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">

            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">
              <span className="text-cyan-400 text-xl">
                ◈
              </span>
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Dataset Benchmark
              </h1>

              <p className="text-slate-400 text-sm mt-1">
                Compare multiple LLMs across the same evaluation dataset.
              </p>
            </div>

          </div>
        </motion.div>

        {/* CONFIGURATION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* DATASET */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.1,
            }}
            className="lg:col-span-1"
          >

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl">

              <h2 className="text-lg font-semibold mb-1">
                Dataset
              </h2>

              <p className="text-sm text-slate-500 mb-5">
                Upload a CSV evaluation dataset.
              </p>

              <label className="block cursor-pointer">

                <div className="border border-dashed border-slate-700 hover:border-cyan-400/50 rounded-xl p-8 text-center transition">

                  <div className="text-3xl mb-3 text-cyan-400">
                    ↑
                  </div>

                  <p className="text-sm text-slate-300">
                    Click to upload CSV
                  </p>

                  <p className="text-xs text-slate-500 mt-2">
                    question · context · reference_answer
                  </p>

                </div>

                <input
                  type="file"
                  accept=".csv"
                  onChange={handleDatasetChange}
                  className="hidden"
                />

              </label>

              {/* UPLOADING */}
              {uploading && (
                <div className="mt-4 p-3 rounded-xl bg-cyan-400/5 border border-cyan-400/20">

                  <div className="flex items-center gap-3">

                    <span className="h-4 w-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />

                    <p className="text-sm text-cyan-400">
                      Uploading dataset...
                    </p>

                  </div>

                </div>
              )}

              {/* DATASET INFO */}
              {dataset && !uploading && (
                <div className="mt-4 p-3 rounded-xl bg-slate-800/70 border border-slate-700">

                  <div className="flex items-center justify-between gap-3">

                    <div className="min-w-0">

                      <p className="text-sm text-slate-200 truncate">
                        {dataset.name}
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        {(dataset.size / 1024).toFixed(1)} KB
                      </p>

                    </div>

                    {datasetId && (
                      <span className="shrink-0 px-2 py-1 rounded-lg bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-xs">
                        Dataset #{datasetId}
                      </span>
                    )}

                  </div>

                </div>
              )}

            </div>
          </motion.div>

          {/* MODELS */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
            }}
            className="lg:col-span-2"
          >

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl">

              <div className="flex items-center justify-between mb-5">

                <div>
                  <h2 className="text-lg font-semibold">
                    Generation Models
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Select exactly three models for comparison.
                  </p>
                </div>

                <div className="px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-xs">
                  3 Models
                </div>

              </div>

              <div className="space-y-4">

                {models.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-slate-950/60 border border-slate-800"
                    >

                      <div className="flex items-center gap-3 mb-3">

                        <div className="h-7 w-7 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-xs text-cyan-400">
                          {index + 1}
                        </div>

                        <span className="text-sm font-medium text-slate-300">
                          Model {index + 1}
                        </span>

                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                        <select
                          value={item.provider}
                          onChange={(e) =>
                            handleProviderChange(
                              index,
                              e.target.value
                            )
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-400 transition"
                        >
                          {Object.entries(providers).map(
                            ([providerKey, providerInfo]) => (
                              <option
                                key={providerKey}
                                value={providerKey}
                              >
                                {providerInfo.name ||
                                  providerKey}
                              </option>
                            )
                          )}
                        </select>

                        <input
                          type="text"
                          value={item.model}
                          onChange={(e) =>
                            handleModelChange(
                              index,
                              "model",
                              e.target.value
                            )
                          }
                          placeholder="Enter model name"
                          required
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-400 transition placeholder:text-slate-600"
                        />

                        <input
                          type="password"
                          placeholder="API key"
                          value={item.api_key}
                          onChange={(e) =>
                            handleModelChange(
                              index,
                              "api_key",
                              e.target.value
                            )
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-400 transition"
                        />

                      </div>

                    </div>
                  )
                )}

              </div>

            </div>
          </motion.div>

        </div>

        {/* JUDGE */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.3,
          }}
          className="mt-6"
        >

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl">

            <div className="mb-5">

              <h2 className="text-lg font-semibold">
                Evaluation Judge
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                The judge evaluates correctness, relevance,
                faithfulness and claim grounding.
              </p>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <select
                value={judgeProvider}
                onChange={(e) =>
                  handleJudgeProviderChange(
                    e.target.value
                  )
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-400 transition"
              >
                {Object.entries(providers).map(
                  ([providerKey, providerInfo]) => (
                    <option
                      key={providerKey}
                      value={providerKey}
                    >
                      {providerInfo.name ||
                        providerKey}
                    </option>
                  )
                )}
              </select>

              <input
                type="text"
                value={judgeModel}
                onChange={(e) =>
                  setJudgeModel(e.target.value)
                }
                placeholder="Enter judge model name"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-400 transition placeholder:text-slate-600"
              />

              <input
                type="password"
                placeholder="Judge API key"
                value={judgeApiKey}
                onChange={(e) =>
                  setJudgeApiKey(e.target.value)
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-400 transition"
              />

            </div>

          </div>
        </motion.div>

        {/* RUN BUTTON */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.4,
          }}
          className="mt-6"
        >

          <button
            onClick={handleRunBenchmark}
            disabled={
              loading ||
              uploading ||
              !datasetId
            }
            className="w-full rounded-2xl py-4 font-semibold text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/10"
          >

            {loading ? (
              <span className="flex items-center justify-center gap-3">

                <span className="h-4 w-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />

                Running Benchmark...

              </span>
            ) : (
              "Run Dataset Benchmark →"
            )}

          </button>

        </motion.div>

        {/* ================================================= */}
        {/* BENCHMARK RESULTS */}
        {/* ================================================= */}

        {benchmarkResult && (
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
            className="mt-10"
          >

            {/* RESULTS HEADER */}

            <div className="mb-6">

              <div className="flex items-center gap-3">

                <div className="h-9 w-9 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">

                  <span className="text-emerald-400">
                    ✓
                  </span>

                </div>

                <div>

                  <h2 className="text-2xl font-bold">
                    Benchmark Results
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">

                    Dataset:{" "}
                    <span className="text-slate-300">
                      {benchmarkResult.filename ||
                        `Dataset #${benchmarkResult.dataset_id}`}
                    </span>

                  </p>

                </div>

              </div>

            </div>

            {/* SUMMARY */}

            {(() => {
              const usage =
                calculateBenchmarkUsage();

              return (
                <div className="space-y-4 mb-6">

                  {/* Basic Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">

                      <p className="text-xs text-slate-500 uppercase tracking-wider">
                        Dataset
                      </p>

                      <p className="text-2xl font-bold text-cyan-400 mt-2">
                        #{benchmarkResult.dataset_id}
                      </p>

                    </div>

                    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">

                      <p className="text-xs text-slate-500 uppercase tracking-wider">
                        Questions
                      </p>

                      <p className="text-2xl font-bold text-white mt-2">
                        {benchmarkResult.results?.length || 0}
                      </p>

                    </div>

                    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">

                      <p className="text-xs text-slate-500 uppercase tracking-wider">
                        Models
                      </p>

                      <p className="text-2xl font-bold text-cyan-400 mt-2">
                        3
                      </p>

                    </div>

                  </div>

                  {/* Token & Cost Summary */}
                  <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl">

                    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">

                      <div>

                        <p className="text-xs text-cyan-400 uppercase tracking-wider">
                          Benchmark Usage
                        </p>

                        <h3 className="text-lg font-semibold mt-1">
                          Token & Cost Summary
                        </h3>

                      </div>

                      <span className="px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-xs">
                        Complete Run
                      </span>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                      {/* Input */}
                      <div className="rounded-xl bg-slate-950/70 border border-cyan-400/10 p-4">

                        <p className="text-xs text-slate-500 uppercase tracking-wider">
                          Input Tokens
                        </p>

                        <p className="text-2xl font-bold text-cyan-400 mt-2">
                          {usage.inputTokens.toLocaleString()}
                        </p>

                        <p className="text-[11px] text-slate-600 mt-1">
                          Across all model runs
                        </p>

                      </div>

                      {/* Output */}
                      <div className="rounded-xl bg-slate-950/70 border border-purple-400/10 p-4">

                        <p className="text-xs text-slate-500 uppercase tracking-wider">
                          Output Tokens
                        </p>

                        <p className="text-2xl font-bold text-purple-400 mt-2">
                          {usage.outputTokens.toLocaleString()}
                        </p>

                        <p className="text-[11px] text-slate-600 mt-1">
                          Generated by models
                        </p>

                      </div>

                      {/* Total */}
                      <div className="rounded-xl bg-slate-950/70 border border-blue-400/10 p-4">

                        <p className="text-xs text-slate-500 uppercase tracking-wider">
                          Total Tokens
                        </p>

                        <p className="text-2xl font-bold text-blue-400 mt-2">
                          {usage.totalTokens.toLocaleString()}
                        </p>

                        <p className="text-[11px] text-slate-600 mt-1">
                          Complete benchmark usage
                        </p>

                      </div>

                      {/* Cost */}
                      <div className="rounded-xl bg-slate-950/70 border border-emerald-400/10 p-4">

                        <p className="text-xs text-slate-500 uppercase tracking-wider">
                          Estimated Cost
                        </p>

                        <p className="text-2xl font-bold text-emerald-400 mt-2">
                          ${usage.estimatedCost.toFixed(6)}
                        </p>

                        <p className="text-[11px] text-slate-600 mt-1">
                          Based on configured pricing
                        </p>

                      </div>

                    </div>

                  </div>

                </div>
              );
            })()}

            {/* MODEL COMPARISON */}

            {benchmarkResult.results?.[0]?.models && (
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl mb-6">

                <div className="mb-5">

                  <h3 className="text-lg font-semibold">
                    Model Comparison
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    Average evaluation metrics and usage across the dataset.
                  </p>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  {benchmarkResult.results[0].models.map(
                    (modelItem, index) => {

                      const allResults =
                        benchmarkResult.results
                          .map(
                            (question) =>
                              question.models?.[index]
                          )
                          .filter(Boolean);

                      const correctness =
                        calculateAverage(
                          allResults,
                          "correctness"
                        );

                      const relevance =
                        calculateAverage(
                          allResults,
                          "relevance"
                        );

                      const faithfulness =
                        calculateAverage(
                          allResults,
                          "faithfulness"
                        );

                      const usage =
                        calculateModelUsage(index);

                      return (
                        <div
                          key={index}
                          className="rounded-xl bg-slate-950/60 border border-slate-800 p-5"
                        >

                          <div className="flex items-center justify-between mb-4">

                            <div className="flex items-center gap-3">

                              <div className="h-8 w-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-xs text-cyan-400">
                                {index + 1}
                              </div>

                              <div>

                                <p className="text-sm font-semibold text-slate-200 break-all">
                                  {modelItem.model}
                                </p>

                                <p className="text-xs text-slate-500">
                                  {modelItem.provider ||
                                    "Provider"}{" "}
                                  · Generation Model
                                </p>

                              </div>

                            </div>

                          </div>

                          <div className="space-y-4">

                            {/* CORRECTNESS */}
                            <div>

                              <div className="flex justify-between text-xs mb-1">

                                <span className="text-slate-400">
                                  Correctness
                                </span>

                                <span className="text-cyan-400">
                                  {correctness}%
                                </span>

                              </div>

                              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">

                                <div
                                  className="h-full bg-cyan-400 rounded-full"
                                  style={{
                                    width: `${correctness}%`,
                                  }}
                                />

                              </div>

                            </div>

                            {/* RELEVANCE */}
                            <div>

                              <div className="flex justify-between text-xs mb-1">

                                <span className="text-slate-400">
                                  Relevance
                                </span>

                                <span className="text-cyan-400">
                                  {relevance}%
                                </span>

                              </div>

                              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">

                                <div
                                  className="h-full bg-cyan-400 rounded-full"
                                  style={{
                                    width: `${relevance}%`,
                                  }}
                                />

                              </div>

                            </div>

                            {/* FAITHFULNESS */}
                            <div>

                              <div className="flex justify-between text-xs mb-1">

                                <span className="text-slate-400">
                                  Faithfulness
                                </span>

                                <span className="text-cyan-400">
                                  {faithfulness}%
                                </span>

                              </div>

                              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">

                                <div
                                  className="h-full bg-cyan-400 rounded-full"
                                  style={{
                                    width: `${faithfulness}%`,
                                  }}
                                />

                              </div>

                            </div>

                          </div>

                          {/* MODEL USAGE */}
                          <div className="mt-5 pt-4 border-t border-slate-800">

                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">
                              Usage & Cost
                            </p>

                            <div className="grid grid-cols-2 gap-2">

                              <div className="bg-slate-900 rounded-lg p-3">

                                <p className="text-[10px] text-slate-500">
                                  Total Tokens
                                </p>

                                <p className="text-sm font-bold text-blue-400 mt-1">
                                  {usage.totalTokens.toLocaleString()}
                                </p>

                              </div>

                              <div className="bg-slate-900 rounded-lg p-3">

                                <p className="text-[10px] text-slate-500">
                                  Estimated Cost
                                </p>

                                <p className="text-sm font-bold text-emerald-400 mt-1">
                                  ${usage.estimatedCost.toFixed(6)}
                                </p>

                              </div>

                              <div className="bg-slate-900 rounded-lg p-3">

                                <p className="text-[10px] text-slate-500">
                                  Input Tokens
                                </p>

                                <p className="text-sm font-bold text-cyan-400 mt-1">
                                  {usage.inputTokens.toLocaleString()}
                                </p>

                              </div>

                              <div className="bg-slate-900 rounded-lg p-3">

                                <p className="text-[10px] text-slate-500">
                                  Output Tokens
                                </p>

                                <p className="text-sm font-bold text-purple-400 mt-1">
                                  {usage.outputTokens.toLocaleString()}
                                </p>

                              </div>

                            </div>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>
            )}

            {/* QUESTION RESULTS */}

            <div className="space-y-6">

              {benchmarkResult.results?.map(
                (questionResult, questionIndex) => (

                  <motion.div
                    key={questionIndex}
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay:
                        questionIndex * 0.05,
                    }}
                    className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl"
                  >

                    {/* QUESTION */}

                    <div className="mb-6">

                      <div className="flex items-center gap-2 mb-2">

                        <span className="px-2 py-1 rounded-lg bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-xs">
                          Question{" "}
                          {questionIndex + 1}
                        </span>

                      </div>

                      <h3 className="text-lg font-semibold text-slate-200">
                        {questionResult.question}
                      </h3>

                    </div>

                    {/* MODEL RESULTS */}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                      {questionResult.models?.map(
                        (modelResult, modelIndex) => (

                          <div
                            key={modelIndex}
                            className="rounded-xl bg-slate-950/60 border border-slate-800 p-5"
                          >

                            {/* MODEL NAME */}

                            <div className="flex items-center gap-3 mb-4">

                              <div className="h-8 w-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-xs text-cyan-400">
                                {modelIndex + 1}
                              </div>

                              <div className="min-w-0">

                                <p className="text-sm font-semibold text-slate-200 break-all">
                                  {modelResult.model}
                                </p>

                              </div>

                            </div>

                            <p className="text-xs text-slate-500 mb-4">

                              Provider:{" "}
                              <span className="text-slate-300">
                                {modelResult.provider ||
                                  "Unknown"}
                              </span>

                            </p>

                            {/* GENERATED ANSWER */}

                            <div className="mb-5">

                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                                Generated Answer
                              </p>

                              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 max-h-52 overflow-y-auto">

                                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                                  {modelResult.generated_answer ||
                                    "No answer returned."}
                                </p>

                              </div>

                            </div>

                            {/* METRICS */}

                            <div className="grid grid-cols-3 gap-2 mb-4">

                              <div className="bg-slate-900 rounded-lg p-3 text-center">

                                <p className="text-xs text-slate-500">
                                  Correct
                                </p>

                                <p className="text-lg font-bold text-cyan-400 mt-1">
                                  {modelResult.evaluation?.correctness ??
                                    "-"}
                                </p>

                              </div>

                              <div className="bg-slate-900 rounded-lg p-3 text-center">

                                <p className="text-xs text-slate-500">
                                  Relevant
                                </p>

                                <p className="text-lg font-bold text-cyan-400 mt-1">
                                  {modelResult.evaluation?.relevance ??
                                    "-"}
                                </p>

                              </div>

                              <div className="bg-slate-900 rounded-lg p-3 text-center">

                                <p className="text-xs text-slate-500">
                                  Faithful
                                </p>

                                <p className="text-lg font-bold text-cyan-400 mt-1">
                                  {modelResult.evaluation?.faithfulness ??
                                    "-"}
                                </p>

                              </div>

                            </div>

                            {/* TOKEN & COST */}

                            <div className="mt-4">

                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                                Usage & Cost
                              </p>

                              <div className="grid grid-cols-2 gap-2">

                                <div className="bg-slate-900 rounded-lg p-3">

                                  <p className="text-[10px] text-slate-500">
                                    Input Tokens
                                  </p>

                                  <p className="text-sm font-bold text-cyan-400 mt-1">
                                    {Number(
                                      modelResult.input_tokens || 0
                                    ).toLocaleString()}
                                  </p>

                                </div>

                                <div className="bg-slate-900 rounded-lg p-3">

                                  <p className="text-[10px] text-slate-500">
                                    Output Tokens
                                  </p>

                                  <p className="text-sm font-bold text-purple-400 mt-1">
                                    {Number(
                                      modelResult.output_tokens || 0
                                    ).toLocaleString()}
                                  </p>

                                </div>

                                <div className="bg-slate-900 rounded-lg p-3">

                                  <p className="text-[10px] text-slate-500">
                                    Total Tokens
                                  </p>

                                  <p className="text-sm font-bold text-blue-400 mt-1">
                                    {Number(
                                      modelResult.total_tokens || 0
                                    ).toLocaleString()}
                                  </p>

                                </div>

                                <div className="bg-slate-900 rounded-lg p-3">

                                  <p className="text-[10px] text-slate-500">
                                    Estimated Cost
                                  </p>

                                  <p className="text-sm font-bold text-emerald-400 mt-1">
                                    $
                                    {Number(
                                      modelResult.estimated_cost || 0
                                    ).toFixed(6)}
                                  </p>

                                </div>

                              </div>

                            </div>

                            {/* LATENCY */}

                            <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-900 px-3 py-2">

                              <span className="text-xs text-slate-500">
                                Latency
                              </span>

                              <span className="text-xs font-semibold text-slate-300">
                                {Number(
                                  modelResult.latency || 0
                                ).toFixed(2)}
                                s
                              </span>

                            </div>

                            {/* HALLUCINATION */}

                            <div className="mt-4 flex items-center justify-between">

                              <span className="text-xs text-slate-500">
                                Hallucination Risk
                              </span>

                              <span
                                className={`px-2 py-1 rounded-lg border text-xs font-medium ${getRiskClass(
                                  modelResult.hallucination_risk?.risk
                                )}`}
                              >
                                {modelResult.hallucination_risk?.risk ||
                                  "UNKNOWN"}
                              </span>

                            </div>

                            {/* HALLUCINATION DETAILS */}

                            {modelResult.hallucination_risk && (
                              <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-3">

                                <div>

                                  <p className="text-xs text-slate-500">
                                    Claims
                                  </p>

                                  <p className="text-sm font-semibold text-slate-300 mt-1">
                                    {modelResult.hallucination_risk.total_claims ??
                                      0}
                                  </p>

                                </div>

                                <div>

                                  <p className="text-xs text-slate-500">
                                    Evidence Coverage
                                  </p>

                                  <p className="text-sm font-semibold text-cyan-400 mt-1">
                                    {modelResult.hallucination_risk.evidence_coverage ??
                                      0}
                                    %
                                  </p>

                                </div>

                                <div>

                                  <p className="text-xs text-slate-500">
                                    Supported
                                  </p>

                                  <p className="text-sm font-semibold text-emerald-400 mt-1">
                                    {modelResult.hallucination_risk.supported ??
                                      0}
                                  </p>

                                </div>

                                <div>

                                  <p className="text-xs text-slate-500">
                                    Contradicted
                                  </p>

                                  <p className="text-sm font-semibold text-red-400 mt-1">
                                    {modelResult.hallucination_risk.contradicted ??
                                      0}
                                  </p>

                                </div>

                              </div>
                            )}

                            {/* CLAIMS & EVIDENCE */}

                            <ClaimsEvidence
                              claims={modelResult.claims}
                            />

                          </div>

                        )
                      )}

                    </div>

                  </motion.div>

                )
              )}

            </div>

          </motion.div>
        )}

      </div>

    </div>
  );
}
