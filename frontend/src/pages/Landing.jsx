import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const features = [
  {
    icon: "⚡",
    title: "Quick Evaluation",
    description:
      "Evaluate an LLM response using correctness, relevance, faithfulness, and hallucination risk.",
  },
  {
    icon: "🔍",
    title: "Claim-Level Detection",
    description:
      "Break generated answers into factual claims and verify them against trusted evidence.",
  },
  {
    icon: "📊",
    title: "Model Benchmarking",
    description:
      "Run the same dataset across multiple models and compare their evaluation results.",
  },
  {
    icon: "🧠",
    title: "Evidence Grounding",
    description:
      "Use retrieved evidence to determine whether generated claims are supported, unsupported, or contradicted.",
  },
  {
    icon: "📈",
    title: "Detailed Metrics",
    description:
      "Track correctness, relevance, faithfulness, latency, token usage, cost, and hallucination risk.",
  },
  {
    icon: "🗂️",
    title: "Evaluation History",
    description:
      "Keep your previous evaluations organized and inspect individual results whenever you need them.",
  },
];

const steps = [
  {
    number: "01",
    title: "Generate",
    description: "Send your question to the selected LLM provider.",
  },
  {
    number: "02",
    title: "Extract Claims",
    description: "Identify the factual claims contained in the generated answer.",
  },
  {
    number: "03",
    title: "Retrieve Evidence",
    description: "Find relevant evidence from the trusted context.",
  },
  {
    number: "04",
    title: "Verify",
    description: "Check whether each claim is supported, unsupported, or contradicted.",
  },
  {
    number: "05",
    title: "Evaluate",
    description: "Calculate quality metrics and overall hallucination risk.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-180px] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute left-[-150px] top-[500px] h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute right-[-150px] top-[900px] h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[130px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20">
              <span className="text-lg font-black text-slate-950">E</span>
            </div>

            <div>
              <h1 className="text-base font-bold tracking-tight">
                LLM Evaluation
              </h1>
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
                Intelligence Platform
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm text-slate-400 transition hover:text-white"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="text-sm text-slate-400 transition hover:text-white"
            >
              How It Works
            </a>

            <a
              href="#metrics"
              className="text-sm text-slate-400 transition hover:text-white"
            >
              Metrics
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white sm:block"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10">
        <section className="mx-auto max-w-7xl px-6 pb-24 pt-20 lg:px-8 lg:pb-32 lg:pt-28">
          <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
            {/* Hero content */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-xs font-medium text-cyan-300">
                <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                AI Evaluation & Hallucination Detection
              </div>

              <h2 className="max-w-4xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                Evaluate LLMs.
                <br />
                <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Detect Hallucinations.
                </span>
              </h2>

              <p className="mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
                Test, compare, and understand AI-generated answers with
                automated evaluation, evidence grounding, and claim-level
                hallucination detection.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-500/10 transition hover:-translate-y-0.5 hover:bg-cyan-300"
                >
                  Start Evaluating
                  <span className="transition group-hover:translate-x-1">
                    →
                  </span>
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.07]"
                >
                  Sign In
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-slate-500">
                <span>✓ Claim-level verification</span>
                <span>✓ Multi-model evaluation</span>
                <span>✓ Evidence-based analysis</span>
              </div>
            </motion.div>

            {/* Evaluation preview */}
            <motion.div
              initial={{ opacity: 0, x: 35 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="relative"
            >
              <div className="absolute -inset-8 rounded-[40px] bg-cyan-500/10 blur-3xl" />

              <div className="relative rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl">
                {/* Window header */}
                <div className="flex items-center justify-between border-b border-white/10 px-3 pb-4">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
                  </div>

                  <span className="text-[10px] uppercase tracking-[0.2em] text-slate-600">
                    Evaluation #29
                  </span>
                </div>

                <div className="p-4">
                  <div className="mb-5">
                    <p className="text-[10px] uppercase tracking-wider text-slate-600">
                      Question
                    </p>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-200">
                      What is BM25 and what is it used for?
                    </p>
                  </div>

                  <div className="mb-5 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.03] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Generation Model
                      </span>
                      <span className="text-xs font-medium text-cyan-300">
                        Groq
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-300">
                      openai/gpt-oss-20b
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      ["Correctness", "95"],
                      ["Relevance", "95"],
                      ["Faithfulness", "95"],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-white/10 bg-white/[0.025] p-3"
                      >
                        <p className="text-[9px] uppercase tracking-wider text-slate-600">
                          {label}
                        </p>
                        <p className="mt-2 text-2xl font-bold text-white">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-600">
                          Hallucination Risk
                        </p>
                        <p className="mt-1 text-lg font-bold text-emerald-300">
                          LOW
                        </p>
                      </div>

                      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10">
                        <span className="text-emerald-300">✓</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[10px] text-slate-600">
                    <span>8 claims analyzed</span>
                    <span>Evidence grounded</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Provider strip */}
        <section className="border-y border-white/5 bg-white/[0.015]">
          <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
            <p className="text-center text-[10px] uppercase tracking-[0.3em] text-slate-600">
              Evaluate across leading AI providers
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {["OpenAI", "Google Gemini", "Groq", "Anthropic Claude"].map(
                (provider) => (
                  <div
                    key={provider}
                    className="rounded-full border border-white/10 bg-white/[0.025] px-5 py-2 text-xs font-medium text-slate-400"
                  >
                    {provider}
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="mx-auto max-w-7xl scroll-mt-20 px-6 py-24 lg:px-8"
        >
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
              Platform capabilities
            </p>

            <h3 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to evaluate AI responses.
            </h3>

            <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base">
              Go beyond a simple model response. Understand quality,
              grounding, and factual reliability at the claim level.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-white/[0.04]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-xl">
                  {feature.icon}
                </div>

                <h4 className="mt-5 text-base font-semibold text-white">
                  {feature.title}
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="scroll-mt-20 border-y border-white/5 bg-white/[0.015]"
        >
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-400">
                How it works
              </p>

              <h3 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                From prompt to evaluation in a few steps.
              </h3>
            </div>

            <div className="mt-14 grid gap-4 md:grid-cols-5">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  className="relative rounded-2xl border border-white/10 bg-slate-950/60 p-5"
                >
                  <span className="text-xs font-bold tracking-wider text-cyan-400">
                    {step.number}
                  </span>

                  <h4 className="mt-5 text-sm font-semibold text-white">
                    {step.title}
                  </h4>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {step.description}
                  </p>

                  {index < steps.length - 1 && (
                    <span className="absolute -right-2.5 top-1/2 hidden text-slate-700 md:block">
                      →
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Metrics */}
        <section
          id="metrics"
          className="mx-auto max-w-7xl scroll-mt-20 px-6 py-24 lg:px-8"
        >
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
                Evaluation intelligence
              </p>

              <h3 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Understand more than just the final answer.
              </h3>

              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
                Analyze multiple dimensions of an LLM response and inspect
                exactly which claims are supported by your evidence.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  [
                    "Correctness",
                    "How accurately the answer matches the reference answer.",
                  ],
                  [
                    "Relevance",
                    "How directly the response answers the question.",
                  ],
                  [
                    "Faithfulness",
                    "How well the answer is supported by the provided context.",
                  ],
                  [
                    "Hallucination Risk",
                    "How much of the generated answer could not be verified.",
                  ],
                ].map(([title, description]) => (
                  <div key={title} className="flex gap-4">
                    <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-[10px] text-cyan-300">
                      ✓
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        {title}
                      </h4>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-black/20">
              <div className="rounded-2xl border border-white/10 bg-slate-950 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-600">
                      Evaluation quality
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      Model response analysis
                    </p>
                  </div>

                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1 text-[10px] text-cyan-300">
                    LIVE
                  </span>
                </div>

                <div className="mt-8 space-y-5">
                  {[
                    ["Correctness", 95],
                    ["Relevance", 95],
                    ["Faithfulness", 95],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="mb-2 flex justify-between text-xs">
                        <span className="text-slate-400">{label}</span>
                        <span className="font-semibold text-white">
                          {value}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${value}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1 }}
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                    <p className="text-[9px] uppercase tracking-wider text-slate-600">
                      Claims
                    </p>
                    <p className="mt-2 text-xl font-bold text-white">8</p>
                  </div>

                  <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.03] p-4">
                    <p className="text-[9px] uppercase tracking-wider text-slate-600">
                      Risk
                    </p>
                    <p className="mt-2 text-xl font-bold text-emerald-300">
                      LOW
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-5xl px-6 pb-24 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-cyan-400/15 bg-gradient-to-br from-cyan-400/[0.08] via-blue-500/[0.04] to-purple-500/[0.08] px-6 py-16 text-center sm:px-12">
            <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-80 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
                Start evaluating
              </p>

              <h3 className="mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
                Know what your LLM actually said — and why.
              </h3>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-500">
                Run your first evaluation and explore claim-level evidence
                verification.
              </p>

              <Link
                to="/register"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-100"
              >
                Create Free Account
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <p className="text-sm font-semibold text-slate-300">
              LLM Evaluation
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Evaluate. Verify. Understand.
            </p>
          </div>

          <p className="text-xs text-slate-600">
            © 2026 LLM Evaluation Platform
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
