import {
  type FormEvent,
  useEffect,
  useState,
} from "react";

import EnvironmentChart from "../components/EnvironmentChart";
import StatCard from "../components/StatCard";
import TemperatureChart from "../components/TemperatureChart";

import {
  getChartData,
  getSummary,
} from "../services/api";

import type {
  ChartReading,
  Summary,
} from "../types/api";

import "./AnalyticsPage.css";

interface TemperaturePoint {
  time: string;
  atriumTemperature: number | null;
  outsideTemperature: number | null;
}

interface EnvironmentPoint {
  time: string;
  noiseLevel: number | null;
  brightnessLevel: number | null;
}

function calculateAverage(
  values: number[],
): number | null {
  if (values.length === 0) {
    return null;
  }

  const total = values.reduce(
    (sum, value) => sum + value,
    0,
  );

  return Number(
    (total / values.length).toFixed(2),
  );
}

function buildTemperatureChartData(
  readings: ChartReading[],
): TemperaturePoint[] {
  const hourlyData = new Map<
    number,
    {
      time: string;
      atriumValues: number[];
      outsideValues: number[];
    }
  >();

  for (const reading of readings) {
    const existing =
      hourlyData.get(reading.hour) ?? {
        time: `${reading.hour
          .toString()
          .padStart(2, "0")}:00`,
        atriumValues: [],
        outsideValues: [],
      };

    if (reading.location === "atrium") {
      existing.atriumValues.push(
        reading.temperature,
      );
    } else {
      existing.outsideValues.push(
        reading.temperature,
      );
    }

    hourlyData.set(
      reading.hour,
      existing,
    );
  }

  return Array.from(
    hourlyData.values(),
  )
    .sort((first, second) =>
      first.time.localeCompare(
        second.time,
      ),
    )
    .map((item) => ({
      time: item.time,

      atriumTemperature:
        calculateAverage(
          item.atriumValues,
        ),

      outsideTemperature:
        calculateAverage(
          item.outsideValues,
        ),
    }));
}

function noiseToNumber(
  noise: string | null,
): number | null {
  const values: Record<string, number> = {
    quiet: 1,
    mild: 2,
    noisy: 3,
    "very noisy": 4,
  };

  return noise
    ? values[noise] ?? null
    : null;
}

function brightnessToNumber(
  brightness: string | null,
): number | null {
  const values: Record<string, number> = {
    dark: 1,
    dim: 2,
    normal: 3,
    bright: 4,
    "very bright": 5,
  };

  return brightness
    ? values[brightness] ?? null
    : null;
}

function buildEnvironmentChartData(
  readings: ChartReading[],
): EnvironmentPoint[] {
  const hourlyData = new Map<
    number,
    {
      time: string;
      noiseValues: number[];
      brightnessValues: number[];
    }
  >();

  for (const reading of readings) {
    // Outside readings do not contain
    // brightness and noise data.
    if (reading.location !== "atrium") {
      continue;
    }

    const existing =
      hourlyData.get(reading.hour) ?? {
        time: `${reading.hour
          .toString()
          .padStart(2, "0")}:00`,
        noiseValues: [],
        brightnessValues: [],
      };

    const noiseValue =
      noiseToNumber(reading.noise);

    const brightnessValue =
      brightnessToNumber(
        reading.brightness,
      );

    if (noiseValue !== null) {
      existing.noiseValues.push(
        noiseValue,
      );
    }

    if (brightnessValue !== null) {
      existing.brightnessValues.push(
        brightnessValue,
      );
    }

    hourlyData.set(
      reading.hour,
      existing,
    );
  }

  return Array.from(
    hourlyData.values(),
  )
    .sort((first, second) =>
      first.time.localeCompare(
        second.time,
      ),
    )
    .map((item) => ({
      time: item.time,

      noiseLevel:
        calculateAverage(
          item.noiseValues,
        ),

      brightnessLevel:
        calculateAverage(
          item.brightnessValues,
        ),
    }));
}

export default function AnalyticsPage() {
  const [selectedDate, setSelectedDate] =
    useState("2026-07-14");

  const [summary, setSummary] =
    useState<Summary | null>(null);

  const [chartData, setChartData] =
    useState<TemperaturePoint[]>([]);

  const [
    environmentChartData,
    setEnvironmentChartData,
  ] = useState<EnvironmentPoint[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  async function loadAnalytics(
    date: string,
  ) {
    setLoading(true);
    setError(null);

    try {
      const [
        summaryData,
        readings,
      ] = await Promise.all([
        getSummary(date),
        getChartData(date),
      ]);

      const formattedChartData =
        buildTemperatureChartData(
          readings,
        );

      const formattedEnvironmentData =
        buildEnvironmentChartData(
          readings,
        );

      setSummary(summaryData);

      setChartData(
        formattedChartData,
      );

      setEnvironmentChartData(
        formattedEnvironmentData,
      );
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "An unknown error occurred.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics(selectedDate);
  }, []);

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    loadAnalytics(selectedDate);
  }

  function changeDate(days: number) {
    /*
     * Adding T12:00:00 avoids some timezone
     * problems that can occur when JavaScript
     * interprets a date at midnight.
     */
    const currentDate = new Date(
      `${selectedDate}T12:00:00`,
    );

    currentDate.setDate(
      currentDate.getDate() + days,
    );

    const year =
      currentDate.getFullYear();

    const month = String(
      currentDate.getMonth() + 1,
    ).padStart(2, "0");

    const day = String(
      currentDate.getDate(),
    ).padStart(2, "0");

    const newDate =
      `${year}-${month}-${day}`;

    setSelectedDate(newDate);

    // Load the new day immediately.
    loadAnalytics(newDate);
  }

  return (
    <main className="analytics-page">
      <header className="analytics-header">
        <p className="eyebrow">
          Daily analytics
        </p>

        <h1>
          Temperature Analysis
        </h1>

        <p>
          Select a day to explore
          temperature statistics,
          important time periods,
          and environmental trends.
        </p>
      </header>

      <form
        className="analytics-controls"
        onSubmit={handleSubmit}
      >
        <div className="day-switcher">
          <button
            className="secondary-button"
            type="button"
            onClick={() =>
              changeDate(-1)
            }
            disabled={loading}
          >
            ← Previous day
          </button>

          <div className="filter-field">
            <label htmlFor="analytics-date">
              Select date
            </label>

            <input
              id="analytics-date"
              type="date"
              value={selectedDate}
              onChange={(event) =>
                setSelectedDate(
                  event.target.value,
                )
              }
            />
          </div>

          <button
            className="secondary-button"
            type="button"
            onClick={() =>
              changeDate(1)
            }
            disabled={loading}
          >
            Next day →
          </button>
        </div>

        <button
          className="primary-button"
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Loading..."
            : "Show analytics"}
        </button>
      </form>

      {error && (
        <section
          className="history-message error-message"
          role="alert"
        >
          <h2>
            Could not load analytics
          </h2>

          <p>{error}</p>
        </section>
      )}

      {!error && loading && (
        <section
          className="history-message"
          role="status"
          aria-live="polite"
        >
          <div className="loading-spinner" />

          <p>
            Loading daily analytics...
          </p>
        </section>
      )}

      {!error &&
        !loading &&
        summary &&
        summary.total_readings === 0 && (
          <section className="history-message">
            <h2>
              No readings for this day
            </h2>

            <p>
              Use Previous day, Next day,
              or the date picker to choose
              another date.
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
                    summary
                      .average_temperature ??
                    "No data"
                  }
                  unit="°C"
                />

                <StatCard
                  title="Minimum temperature"
                  value={
                    summary
                      .minimum_temperature ??
                    "No data"
                  }
                  unit="°C"
                />

                <StatCard
                  title="Maximum temperature"
                  value={
                    summary
                      .maximum_temperature ??
                    "No data"
                  }
                  unit="°C"
                />

                <StatCard
                  title="Total readings"
                  value={
                    summary.total_readings
                  }
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
                  This was the coolest
                  recorded point of the
                  selected day.
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
                  This was the hottest
                  recorded point of the
                  selected day.
                </p>
              </article>
            </section>

            <section className="analytics-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">
                    Temperature trend
                  </p>

                  <h2>
                    Atrium and outside
                    temperature by hour
                  </h2>
                </div>
              </div>

              <article className="chart-card">
                {chartData.length > 0 ? (
                  <TemperatureChart
                    data={chartData}
                  />
                ) : (
                  <div className="chart-empty-state">
                    No temperature chart
                    data is available for
                    this day.
                  </div>
                )}
              </article>
            </section>

            <section className="analytics-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">
                    Atrium environment
                  </p>

                  <h2>
                    Noise and brightness
                    by hour
                  </h2>
                </div>
              </div>

              <article className="chart-card">
                {environmentChartData.length >
                0 ? (
                  <EnvironmentChart
                    data={
                      environmentChartData
                    }
                  />
                ) : (
                  <div className="chart-empty-state">
                    No noise or brightness
                    data is available for
                    this day.
                  </div>
                )}
              </article>

              <div className="environment-scale-legend">
                <p>
                  <strong>Noise:</strong>
                  {" "}
                  1 Quiet, 2 Mild,
                  3 Noisy, 4 Very noisy
                </p>

                <p>
                  <strong>
                    Brightness:
                  </strong>
                  {" "}
                  1 Dark, 2 Dim,
                  3 Normal, 4 Bright,
                  5 Very bright
                </p>
              </div>
            </section>
          </>
        )}
    </main>
  );
}