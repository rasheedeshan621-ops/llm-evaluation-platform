import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
  event.preventDefault();

  try {
    setLoading(true);
    setError("");

    const response = await axios.post(
      "https://llm-evaluation-platform-6v8t.onrender.com/api/auth/login",
      {
        email: form.email,
        password: form.password,
      }
    );

    localStorage.setItem(
      "access_token",
      response.data.access_token
    );

    navigate("/dashboard");
  } catch (err) {
    console.error("Login error:", err);

    setError(
      err.response?.data?.detail ||
        "Login failed. Please check your email and password."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
        <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl sm:p-8">

          {/* Header */}
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">
              LLM Evaluation Platform
            </p>

            <h1 className="mt-3 text-3xl font-bold text-white">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Sign in to continue to your evaluations.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3">
              <p className="text-sm text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Email */}
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-400">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-400">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>

          {/* Register */}
          <p className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="font-medium text-cyan-400 hover:text-cyan-300"
            >
              Create Account
            </button>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;
