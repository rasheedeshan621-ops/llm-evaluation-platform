import React from "react";

const ModelPerformance = ({ models }) => {
  if (!models || models.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <p className="text-sm text-slate-400">
          No model performance data available.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">
          Model Performance
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Average performance across evaluations
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                Model
              </th>

              <th className="px-4 py-3 text-center text-[10px] uppercase tracking-wider text-slate-500">
                Correctness
              </th>

              <th className="px-4 py-3 text-center text-[10px] uppercase tracking-wider text-slate-500">
                Relevance
              </th>

              <th className="px-4 py-3 text-center text-[10px] uppercase tracking-wider text-slate-500">
                Faithfulness
              </th>
            </tr>
          </thead>

          <tbody>
            {models.map((model, index) => (
              <tr
                key={`${model.model}-${index}`}
                className="border-b border-slate-800/70 last:border-b-0"
              >
                <td className="px-4 py-4">
                  <span className="text-sm font-medium text-slate-300">
                    {model.model}
                  </span>
                </td>

                <td className="px-4 py-4 text-center">
                  <span className="text-sm font-semibold text-cyan-400">
                    {model.average_correctness}
                  </span>
                </td>

                <td className="px-4 py-4 text-center">
                  <span className="text-sm font-semibold text-cyan-400">
                    {model.average_relevance}
                  </span>
                </td>

                <td className="px-4 py-4 text-center">
                  <span className="text-sm font-semibold text-cyan-400">
                    {model.average_faithfulness}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ModelPerformance;