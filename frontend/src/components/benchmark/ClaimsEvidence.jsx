import React from "react";

const ClaimsEvidence = ({ claims }) => {
  if (!claims || claims.length === 0) {
    return null;
  }

  return (
    <div className="mt-5 pt-5 border-t border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-slate-200">
            Claims & Evidence
          </p>

          <p className="text-xs text-slate-500 mt-1">
            Claim-level grounding verification
          </p>
        </div>

        <span className="px-2 py-1 rounded-lg bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-xs">
          {claims.length} Claims
        </span>
      </div>

      <div className="space-y-3">
        {claims.map((claimItem, claimIndex) => {
          const status =
            claimItem.verification?.status || "UNSUPPORTED";

          const statusClass =
            status === "SUPPORTED"
              ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
              : status === "CONTRADICTED"
              ? "text-red-400 bg-red-400/10 border-red-400/20"
              : "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";

          return (
            <div
              key={claimIndex}
              className="rounded-xl bg-slate-900 border border-slate-800 p-4"
            >
              {/* CLAIM */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3 min-w-0">
                  <div className="shrink-0 h-6 w-6 rounded-md bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-xs text-cyan-400">
                    {claimIndex + 1}
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {claimItem.claim}
                  </p>
                </div>

                <span
                  className={`shrink-0 px-2 py-1 rounded-lg border text-[10px] font-semibold ${statusClass}`}
                >
                  {status}
                </span>
              </div>

              {/* RETRIEVED EVIDENCE */}
              {claimItem.evidence?.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
                    Retrieved Evidence
                  </p>

                  <div className="space-y-2">
                    {claimItem.evidence.map(
                      (evidenceItem, evidenceIndex) => (
                        <div
                          key={evidenceIndex}
                          className="rounded-lg bg-slate-950 border border-slate-800 p-3"
                        >
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {evidenceItem.evidence}
                          </p>

                          {evidenceItem.score !== undefined && (
                            <p className="text-[10px] text-slate-600 mt-2">
                              BM25 Score:{" "}
                              {Number(evidenceItem.score).toFixed(3)}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* VERIFICATION REASON */}
              {claimItem.verification?.reason && (
                <div className="mt-3">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                    Verification Reason
                  </p>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    {claimItem.verification.reason}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClaimsEvidence;