import {
  BrowserRouter,
  NavLink,
  Route,
  Routes,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import HistoryPage from "./pages/HistoryPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ReportsPage from "./pages/ReportsPage";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <nav className="main-navigation">
        <div className="navigation-content">
          <NavLink
            className="brand-link"
            to="/"
          >
            Atrium Advisor
          </NavLink>

          <div className="navigation-links">
            <NavLink
              className={({ isActive }) =>
                isActive
                  ? "navigation-link active"
                  : "navigation-link"
              }
              to="/"
              end
            >
              Dashboard
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                isActive
                  ? "navigation-link active"
                  : "navigation-link"
              }
              to="/history"
            >
              History
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                isActive
                  ? "navigation-link active"
                  : "navigation-link"
              }
              to="/analytics"
            >
              Analytics
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                isActive
                  ? "navigation-link active"
                  : "navigation-link"
              }
              to="/reports"
            >
              Reports
            </NavLink>
          </div>
        </div>
      </nav>

      <Routes>
        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/history"
          element={<HistoryPage />}
        />

        <Route
          path="/analytics"
          element={<AnalyticsPage />}
        />

        <Route
          path="/reports"
          element={<ReportsPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;