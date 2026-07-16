import { useEffect, useState } from "react";

import ComfortCard from "../components/ComfortCard";
import RecommendationCard from "../components/RecommendationCard";
import StatCard from "../components/StatCard";

import {
  getComfortScore,
  getRecommendations,
  getSummary,
} from "../services/api";

import type {
  ComfortScore,
  Recommendation,
  Summary,
} from "../types/api";

import "./Dashboard.css";

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);

  const [comfort, setComfort] =
    useState<ComfortScore | null>(null);

  const [recommendation, setRecommendation] =
    useState<Recommendation | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [
          summaryData,
          comfortData,
          recommendationData,
        ] = await Promise.all([
          getSummary(),
          getComfortScore(),
          getRecommendations(),
        ]);

        setSummary(summaryData);
        setComfort(comfortData);
        setRecommendation(recommendationData);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      }
    }

    loadDashboard();
  }, []);

  if (error) {
    return (
      <main className="dashboard-page">
        <section className="message-card error-card">
          <h1>Could not load the dashboard</h1>
          <p>{error}</p>
          <p>
            Check that the FastAPI backend is running on port
            8000.
          </p>
        </section>
      </main>
    );
  }

  if (!summary || !comfort || !recommendation) {
    return (
      <main className="dashboard-page">
        <section className="message-card">
          <div className="loading-spinner" />
          <h1>Loading atrium conditions...</h1>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">NU Smart Space</p>
          <h1>Atrium Advisor</h1>
          <p className="header-description">
            Understand current conditions and choose a better
            time for studying, meetings, or rest.
          </p>
        </div>

        <div className="live-badge">
          <span className="live-dot" />
          Sensor data available
        </div>
      </header>

      <section className="dashboard-section">
        <ComfortCard
          score={comfort.comfort_score}
          status={comfort.status}
        />
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Temperature analytics</p>
            <h2>Recorded conditions</h2>
          </div>

          <p>
            Calculated from {summary.total_readings} sensor
            readings
          </p>
        </div>

        <div className="stats-grid">
          <StatCard
            title="Average temperature"
            value={summary.average_temperature}
            unit="°C"
          />

          <StatCard
            title="Minimum temperature"
            value={summary.minimum_temperature}
            unit="°C"
          />

          <StatCard
            title="Maximum temperature"
            value={summary.maximum_temperature}
            unit="°C"
          />

          <StatCard
            title="Total readings"
            value={summary.total_readings}
          />
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Smart recommendation</p>
            <h2>Plan your visit</h2>
          </div>
        </div>

        <RecommendationCard
          time={recommendation.best_study_time}
          location={recommendation.recommended_location}
          score={recommendation.comfort_score}
        />
      </section>
    </main>
  );
}