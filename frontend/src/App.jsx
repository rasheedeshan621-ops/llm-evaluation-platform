import { BrowserRouter, Routes, Route } from "react-router-dom";

import QuickEvaluation from "./pages/QuickEvaluation";
import DatasetBenchmark from "./pages/DatasetBenchmark";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/Landing";

import Navigation from "./components/Navigation";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Navigation />

      <Routes>

        {/* =========================
            Public Routes
        ========================== */}
        <Route path="/" element={<Landing />} />

        
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =========================
            Protected Routes
        ========================== */}

        <Route element={<ProtectedRoute />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/quick-evaluation"
            element={<QuickEvaluation />}
          />

          <Route
            path="/dataset-benchmark"
            element={<DatasetBenchmark />}
          />

          <Route
            path="/history"
            element={<History />}
          />

        </Route>


        {/* =========================
            Home
        ========================== */}

        <Route
          path="/"
          element={
            <div className="flex min-h-screen items-center justify-center">
              <h1 className="text-3xl font-bold">
                LLM Evaluation Platform
              </h1>
            </div>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;