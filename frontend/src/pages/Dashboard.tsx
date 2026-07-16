import {
  useEffect,
  useState,
} from "react";

import ComfortCard from "../components/ComfortCard";
import RecommendationCard from "../components/RecommendationCard";
import StatCard from "../components/StatCard";

import {
  getComfortScore,
  getCurrentRecommendation,
  getCurrentState,
  getRecommendations,
  getSummary,
} from "../services/api";

import type {
  ComfortScore,
  CurrentRecommendation,
  CurrentState,
  Recommendation,
  Summary,
} from "../types/api";

import "./Dashboard.css";

function formatSummaryDate(
  dateValue: string | null,
): string {
  if (!dateValue) {
    return "No date available";
  }

  return new Date(
    `${dateValue}T12:00:00`,
  ).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );
}

function getActivityIcon(
  activity:
    CurrentRecommendation["activity"],
): string {
  if (activity === "study") {
    return "📚";
  }

  if (activity === "outside") {
    return "🌿";
  }

  return "🏠";
}

export default function Dashboard() {
  const [summary, setSummary] =
    useState<Summary | null>(null);

  const [comfort, setComfort] =
    useState<ComfortScore | null>(null);

  const [
    recommendation,
    setRecommendation,
  ] =
    useState<Recommendation | null>(
      null,
    );

  const [
    currentRecommendation,
    setCurrentRecommendation,
  ] =
    useState<
      CurrentRecommendation | null
    >(null);

  const [
    currentState,
    setCurrentState,
  ] =
    useState<CurrentState | null>(
      null,
    );

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [
          summaryData,
          comfortData,
          recommendationData,
          currentRecommendationData,
          currentStateData,
        ] = await Promise.all([
          getSummary(
            undefined,
            "atrium",
          ),
          getComfortScore(),
          getRecommendations(),
          getCurrentRecommendation(),
          getCurrentState(),
        ]);

        setSummary(summaryData);

        setComfort(
          comfortData,
        );

        setRecommendation(
          recommendationData,
        );

        setCurrentRecommendation(
          currentRecommendationData,
        );

        setCurrentState(
          currentStateData,
        );

        setError(null);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(
            "An unknown error occurred.",
          );
        }
      }
    }

    loadDashboard();

    const intervalId =
      window.setInterval(
        loadDashboard,
        60_000,
      );

    return () => {
      window.clearInterval(
        intervalId,
      );
    };
  }, []);

  if (error) {
    return (
      <main className="dashboard-page">
        <section className="message-card error-card">
          <h1>
            Could not load the dashboard
          </h1>

          <p>{error}</p>

          <p>
            Check that the FastAPI backend
            is running on port 8000.
          </p>
        </section>
      </main>
    );
  }

  if (
    !summary ||
    !comfort ||
    !recommendation ||
    !currentRecommendation ||
    !currentState
  ) {
    return (
      <main className="dashboard-page">
        <section className="message-card">
          <div className="loading-spinner" />

          <h1>
            Loading atrium conditions...
          </h1>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">
            NU Smart Space
          </p>

          <h1>
            Atrium Monitor
          </h1>

          <p className="header-description">
            Understand current conditions
            and choose a better time for
            studying, meetings, or rest.
          </p>
        </div>

        <div className="live-badge">
          <span className="live-dot" />
          Sensor data available
        </div>
      </header>

      <section className="dashboard-section">
        <div
          className={`activity-recommendation activity-${currentRecommendation.activity}`}
        >
          <div className="activity-icon">
            {getActivityIcon(
              currentRecommendation
                .activity,
            )}
          </div>

          <div className="activity-content">
            <p className="card-label">
              Recommended right now
            </p>

            <h2>
              {
                currentRecommendation
                  .title
              }
            </h2>

            <p>
              {
                currentRecommendation
                  .reason
              }
            </p>

            <div className="activity-details">
              <span>
                Atrium:{" "}
                {
                  currentRecommendation
                    .atrium_temperature
                }
                °C
              </span>

              <span>
                Outside:{" "}
                {currentRecommendation
                  .outside_temperature !==
                null
                  ? `${currentRecommendation.outside_temperature}°C`
                  : "No data"}
              </span>

              <span>
                Comfort:{" "}
                {
                  currentRecommendation
                    .comfort_score
                }
                /100
              </span>
            </div>
          </div>

          <time className="activity-time">
            Updated:{" "}
            {new Date(
              currentRecommendation
                .measured_at,
            ).toLocaleString()}
          </time>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              Current conditions
            </p>

            <h2>
              Latest atrium status
            </h2>
          </div>

          <p>
            Last updated:{" "}
            {new Date(
              currentState.atrium
                .measured_at,
            ).toLocaleString()}
          </p>
        </div>

        <div className="current-status-card">
          <div>
            <p className="card-label">
              Current assessment
            </p>

            <h2>
              {currentState.status}
            </h2>

            <p className="current-status-description">
              Based on the latest available
              atrium sensor reading.
            </p>
          </div>
        </div>

        <div className="stats-grid current-stats-grid">
          <StatCard
            title="Atrium temperature"
            value={
              currentState.atrium
                .temperature
            }
            unit="°C"
          />

          <StatCard
            title="Outside temperature"
            value={
              currentState.outside
                .temperature ??
              "No data"
            }
            unit={
              currentState.outside
                .temperature !== null
                ? "°C"
                : undefined
            }
          />

          <StatCard
            title="Brightness"
            value={
              currentState.atrium
                .brightness ??
              "Unknown"
            }
          />

          <StatCard
            title="Noise"
            value={
              currentState.atrium
                .noise ??
              "Unknown"
            }
          />
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              Atrium comfort
            </p>

            <h2>
              Current comfort score
            </h2>
          </div>

          <p>
            Last updated:{" "}
            {new Date(
              comfort.measured_at,
            ).toLocaleString()}
          </p>
        </div>

        <ComfortCard
          score={comfort.comfort_score}
          status={comfort.status}
        />
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              Daily atrium summary
            </p>

            <h2>
              Latest day overview
            </h2>
          </div>

          <p>
            Data from:{" "}
            {formatSummaryDate(
              summary.date,
            )}
          </p>
        </div>

        <div className="stats-grid">
          <StatCard
            title="Average temperature"
            value={
              summary.average_temperature ??
              "No data"
            }
            unit={
              summary.average_temperature !==
              null
                ? "°C"
                : undefined
            }
          />

          <StatCard
            title="Minimum temperature"
            value={
              summary.minimum_temperature ??
              "No data"
            }
            unit={
              summary.minimum_temperature !==
              null
                ? "°C"
                : undefined
            }
          />

          <StatCard
            title="Maximum temperature"
            value={
              summary.maximum_temperature ??
              "No data"
            }
            unit={
              summary.maximum_temperature !==
              null
                ? "°C"
                : undefined
            }
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
            <p className="eyebrow">
              Predicted study period
            </p>

            <h2>
              Best time to study
            </h2>
          </div>
        </div>

        <RecommendationCard
          time={
            recommendation.best_study_time
          }
          location={
            recommendation
              .recommended_location
          }
          score={
            recommendation.comfort_score ??
            undefined
          }
        />
      </section>
    </main>
  );
}