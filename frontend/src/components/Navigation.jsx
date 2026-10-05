import { NavLink, useNavigate } from "react-router-dom";

const Navigation = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Quick Evaluation", path: "/quick-evaluation" },
    { name: "Dataset Benchmark", path: "/dataset-benchmark" },
    { name: "History", path: "/history" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <nav className="border-b border-slate-800 bg-slate-950/95 px-4 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">

        {/* Logo */}
        <div className="shrink-0">
          <p className="text-sm font-bold text-white sm:text-base">
            LLM Evaluation
          </p>

          <p className="hidden text-[10px] text-slate-500 sm:block">
            Evaluation Platform
          </p>
        </div>

        {/* Navigation */}
        {token && (
          <div className="flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition sm:px-4 sm:text-sm ${
                    isActive
                      ? "border border-cyan-400/20 bg-cyan-400/10 text-cyan-400"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="ml-2 whitespace-nowrap rounded-lg border border-red-400/20 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-400/10 sm:px-4 sm:text-sm"
            >
              Logout
            </button>
          </div>
        )}

      </div>
    </nav>
  );
};

export default Navigation;