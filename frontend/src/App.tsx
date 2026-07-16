import {
  BrowserRouter,
  NavLink,
  Route,
  Routes,
} from "react-router-dom";

import AnalyticsPage from "./pages/AnalyticsPage";
import Dashboard from "./pages/Dashboard";
import HistoryPage from "./pages/HistoryPage";
import ReportsPage from "./pages/ReportsPage";

import "./App.css";

function navigationClass({
  isActive,
}: {
  isActive: boolean;
}) {
  return isActive
    ? "navigation-link active"
    : "navigation-link";
}

function mobileNavigationClass({
  isActive,
}: {
  isActive: boolean;
}) {
  return isActive
    ? "mobile-nav-link active"
    : "mobile-nav-link";
}

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
              className={navigationClass}
              to="/"
              end
            >
              Dashboard
            </NavLink>

            <NavLink
              className={navigationClass}
              to="/history"
            >
              History
            </NavLink>

            <NavLink
              className={navigationClass}
              to="/analytics"
            >
              Analytics
            </NavLink>

            <NavLink
              className={navigationClass}
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

      <nav
        className="mobile-navigation"
        aria-label="Mobile navigation"
      >
        <NavLink
          className={mobileNavigationClass}
          to="/"
          end
        >
          <span
            className="mobile-nav-icon"
            aria-hidden="true"
          >
            🏠
          </span>

          <span className="mobile-nav-label">
            Home
          </span>
        </NavLink>

        <NavLink
          className={mobileNavigationClass}
          to="/history"
        >
          <span
            className="mobile-nav-icon"
            aria-hidden="true"
          >
            🕘
          </span>

          <span className="mobile-nav-label">
            History
          </span>
        </NavLink>

        <NavLink
          className={mobileNavigationClass}
          to="/analytics"
        >
          <span
            className="mobile-nav-icon"
            aria-hidden="true"
          >
            📊
          </span>

          <span className="mobile-nav-label">
            Analytics
          </span>
        </NavLink>

        <NavLink
          className={mobileNavigationClass}
          to="/reports"
        >
          <span
            className="mobile-nav-icon"
            aria-hidden="true"
          >
            💬
          </span>

          <span className="mobile-nav-label">
            Reports
          </span>
        </NavLink>
      </nav>
    </BrowserRouter>
  );
}

export default App;