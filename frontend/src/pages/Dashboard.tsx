import { useEffect, useState } from "react";

import ComfortCard from "../components/ComfortCard";
import RecommendationCard from "../components/RecommendationCard";
import StatCard from "../components/StatCard";

import {
  getComfortScore,
  getCurrentState,
  getRecommendations,
  getSummary,
} from "../services/api";

import type {
  ComfortScore,
  CurrentState,
  Recommendation,
  Summary,
} from "../types/api";

import "./Dashboard.css";

export default function Dashboard() {
  const [summary, setSummary] =
  useState<Summary | null>(null);

const [comfort, setComfort] =
  useState<ComfortScore | null>(null);

const [recommendation, setRecommendation] =
  useState<Recommendation | null>(null);

const [currentState, setCurrentState] =
  useState<CurrentState | null>(null);

const [error, setError] =
  useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [
          summaryData,
          comfortData,
          recommendationData,
          currentStateData,
        ] = await Promise.all([
          getSummary(),
          getComfortScore(),
          getRecommendations(),
          getCurrentState(),
        ]);

        setSummary(summaryData);
        setComfort(comfortData);
        setRecommendation(recommendationData);
        setCurrentState(currentStateData);
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

  if (!summary || !comfort || !recommendation || !currentState) {
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
        <div className="section-heading">
          <div>
            <p className="eyebrow">Current conditions</p>
            <h2>Latest atrium status</h2>
          </div>

          <p>
            Last updated:{" "}
            {new Date(
              currentState.atrium.measured_at
            ).toLocaleString()}
          </p>
        </div>

        <div className="current-status-card">
          <div>
            <p className="card-label">Current assessment</p>

            <h2>{currentState.status}</h2>

            <p className="current-status-description">
              Based on the latest available atrium sensor reading.
            </p>
          </div>
        </div>

        <div className="stats-grid current-stats-grid">
          <StatCard
            title="Atrium temperature"
            value={currentState.atrium.temperature}
            unit="°C"
          />

          <StatCard
            title="Outside temperature"
            value={
              currentState.outside.temperature ?? "No data"
            }
            unit={
              currentState.outside.temperature !== null
                ? "°C"
                : undefined
            }
          />

          <StatCard
            title="Brightness"
            value={
              currentState.atrium.brightness ?? "Unknown"
            }
          />

          <StatCard
            title="Noise"
            value={
              currentState.atrium.noise ?? "Unknown"
            }
          />
        </div>
      </section>

      <section className="dashboard-section">
        <ComfortCard
          score={comfort.comfort_score}
          status={comfort.status}
        />
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