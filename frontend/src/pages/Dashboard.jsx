import { useEffect, useState } from "react";
import axios from "axios";

import MetricCard from "../components/dashboard/MetricCard";
import RiskCard from "../components/dashboard/RiskCard";
import RecentEvaluations from "../components/dashboard/RecentEvaluations";
import ModelPerformance from "../components/dashboard/ModelPerformance";

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    const token = localStorage.getItem("access_token");

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://127.0.0.1:8000/api/dashboard/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDashboard(response.data);
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-sm text-cyan-400">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-6 text-center">
          <p className="text-red-400">{error}</p>

          <button
            onClick={fetchDashboard}
            className="mt-4 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">
            LLM Evaluation Platform
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Monitor evaluation quality, model performance, and
            hallucination risk.
          </p>
        </div>

        {/* Main Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Evaluations"
            value={dashboard.total_evaluations}
            subtitle="All evaluations"
            icon="◉"
          />

          <MetricCard
            title="Average Correctness"
            value={`${dashboard.average_correctness}%`}
            subtitle="Across all evaluations"
            icon="✓"
          />

          <MetricCard
            title="Average Relevance"
            value={`${dashboard.average_relevance}%`}
            subtitle="Across all evaluations"
            icon="↗"
          />

          <MetricCard
            title="Average Faithfulness"
            value={`${dashboard.average_faithfulness}%`}
            subtitle="Groundedness score"
            icon="◆"
          />
           <MetricCard
    title="Total Tokens"
    value={Number(dashboard.total_tokens || 0).toLocaleString()}
    subtitle="Across all evaluations"
    icon="⌁"
  />

  <MetricCard
    title="Estimated Cost"
    value={`$${Number(dashboard.total_estimated_cost || 0).toFixed(6)}`}
    subtitle="Total evaluation cost"
    icon="$"
  />

  <MetricCard
    title="Average Tokens"
    value={Number(dashboard.average_tokens || 0).toLocaleString()}
    subtitle="Per evaluation"
    icon="◌"
  />

  <MetricCard
    title="Average Cost"
    value={`$${Number(dashboard.average_cost || 0).toFixed(6)}`}
    subtitle="Average cost per evaluation"
    icon="◈"
  />


        </div>

        {/* Hallucination Risk */}
        <div className="mt-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">
              Hallucination Risk
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Distribution of detected hallucination risk
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <RiskCard
              title="High Risk"
              value={dashboard.hallucination_risk.high}
              description="High hallucination risk"
              type="HIGH"
            />

            <RiskCard
              title="Medium Risk"
              value={dashboard.hallucination_risk.medium}
              description="Medium hallucination risk"
              type="MEDIUM"
            />

            <RiskCard
              title="Low Risk"
              value={dashboard.hallucination_risk.low}
              description="Low hallucination risk"
              type="LOW"
            />
          </div>
        </div>

        {/* Recent Evaluations */}
        <div className="mt-6">
          <RecentEvaluations
            evaluations={dashboard.recent_evaluations}
          />
        </div>

        {/* Model Performance */}
        <div className="mt-6">
          <ModelPerformance
            models={dashboard.model_performance}
          />
        </div>

      </div>
    </div>
  );
};

export default Dashboard;