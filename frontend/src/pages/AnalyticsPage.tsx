import {
  type FormEvent,
  useEffect,
  useState,
} from "react";

import StatCard from "../components/StatCard";
import { getSummary } from "../services/api";

import type { Summary } from "../types/api";

import "./AnalyticsPage.css";

export default function AnalyticsPage() {
  const [selectedDate, setSelectedDate] =
    useState("2026-07-14");

  const [summary, setSummary] =
    useState<Summary | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  async function loadSummary(date: string) {
    setLoading(true);
    setError(null);

    try {
      const data = await getSummary(date);
      setSummary(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSummary(selectedDate);
  }, []);

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    loadSummary(selectedDate);
  }

  return (
    <main className="analytics-page">
      <header className="analytics-header">
        <p className="eyebrow">
          Daily analytics
        </p>

        <h1>Temperature Analysis</h1>

        <p>
          Select a day to explore temperature
          statistics and important time periods.
        </p>
      </header>

      <form
        className="analytics-controls"
        onSubmit={handleSubmit}
      >
        <div className="filter-field">
          <label htmlFor="analytics-date">
            Select date
          </label>

          <input
            id="analytics-date"
            type="date"
            value={selectedDate}
            onChange={(event) =>
              setSelectedDate(event.target.value)
            }
          />
        </div>

        <button
          className="primary-button"
          type="submit"
        >
          Show analytics
        </button>
      </form>

      {error && (
        <section className="history-message error-message">
          <h2>Could not load analytics</h2>
          <p>{error}</p>
        </section>
      )}

      {!error && loading && (
        <section className="history-message">
          <div className="loading-spinner" />
          <p>Loading daily analytics...</p>
        </section>
      )}

      {!error &&
        !loading &&
        summary &&
        summary.total_readings === 0 && (
          <section className="history-message">
            <h2>No readings for this day</h2>

            <p>
              Choose another date to view
              analytics.
            </p>
          </section>
        )}

      {!error &&
        !loading &&
        summary &&
        summary.total_readings > 0 && (
          <>
            <section className="analytics-section">
              <div className="stats-grid">
                <StatCard
                  title="Average temperature"
                  value={
                    summary.average_temperature ??
                    "No data"
                  }
                  unit="°C"
                />

                <StatCard
                  title="Minimum temperature"
                  value={
                    summary.minimum_temperature ??
                    "No data"
                  }
                  unit="°C"
                />

                <StatCard
                  title="Maximum temperature"
                  value={
                    summary.maximum_temperature ??
                    "No data"
                  }
                  unit="°C"
                />

                <StatCard
                  title="Total readings"
                  value={summary.total_readings}
                />
              </div>
            </section>

            <section className="analytics-insights">
              <article className="insight-card">
                <p className="card-label">
                  Coolest time
                </p>

                <h2>
                  {summary.coolest_time
                    ? new Date(
                        summary.coolest_time,
                      ).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )
                    : "Not available"}
                </h2>

                <p>
                  This was the coolest recorded
                  point of the selected day.
                </p>
              </article>

              <article className="insight-card">
                <p className="card-label">
                  Hottest time
                </p>

                <h2>
                  {summary.hottest_time
                    ? new Date(
                        summary.hottest_time,
                      ).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )
                    : "Not available"}
                </h2>

                <p>
                  This was the hottest recorded
                  point of the selected day.
                </p>
              </article>
            </section>
          </>
        )}
    </main>
  );
}