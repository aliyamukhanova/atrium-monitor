import {
  type FormEvent,
  useEffect,
  useState,
} from "react";

import { getReadings } from "../services/api";

import type {
  Reading,
  ReadingFilters,
} from "../types/api";

import "./HistoryPage.css";

const initialFilters: ReadingFilters = {
  date: "",
  location: "",
  noise: "",
  brightness: "",
  minTemperature: "",
  maxTemperature: "",
  sortBy: "time",
  sortOrder: "desc",
};

function normalizeLocation(
  location: string,
): "atrium" | "outside" {
  return location
    .trim()
    .toLowerCase() === "atrium"
    ? "atrium"
    : "outside";
}

function formatLocation(
  location: string,
): string {
  return normalizeLocation(location) ===
    "atrium"
    ? "Atrium"
    : "Outside";
}

function formatCategory(
  value: string | null,
): string {
  if (!value) {
    return "Not available";
  }

  return value
    .split(" ")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

export default function HistoryPage() {
  const [filters, setFilters] =
    useState<ReadingFilters>(
      initialFilters,
    );

  const [readings, setReadings] =
    useState<Reading[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  async function loadReadings(
    selectedFilters: ReadingFilters,
  ) {
    setLoading(true);
    setError(null);

    try {
      const data = await getReadings(
        selectedFilters,
      );

      setReadings(data);
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
    loadReadings(initialFilters);
  }, []);

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    loadReadings(filters);
  }

  function handleReset() {
    setFilters(initialFilters);
    loadReadings(initialFilters);
  }

  return (
    <main className="history-page">
      <header className="history-header">
        <div>
          <p className="eyebrow">
            Sensor history
          </p>

          <h1>
            Measurement History
          </h1>

          <p>
            Explore past atrium and outdoor
            conditions using filters and
            sorting.
          </p>
        </div>
      </header>

      <form
        className="history-filters"
        onSubmit={handleSubmit}
      >
        <div className="filter-field">
          <label htmlFor="history-date">
            Date
          </label>

          <input
            id="history-date"
            type="date"
            value={filters.date}
            onChange={(event) =>
              setFilters({
                ...filters,
                date: event.target.value,
              })
            }
          />
        </div>

        <div className="filter-field">
          <label htmlFor="history-location">
            Location
          </label>

          <select
            id="history-location"
            value={filters.location}
            onChange={(event) =>
              setFilters({
                ...filters,
                location:
                  event.target.value as
                    | ""
                    | "atrium"
                    | "outside",
              })
            }
          >
            <option value="">
              All locations
            </option>

            <option value="atrium">
              Atrium
            </option>

            <option value="outside">
              Outside
            </option>
          </select>
        </div>

        <div className="filter-field">
          <label htmlFor="history-noise">
            Noise
          </label>

          <select
            id="history-noise"
            value={filters.noise}
            onChange={(event) =>
              setFilters({
                ...filters,
                noise: event.target.value,
              })
            }
          >
            <option value="">
              All noise levels
            </option>

            <option value="quiet">
              Quiet
            </option>

            <option value="mild">
              Mild noise
            </option>

            <option value="noisy">
              Noisy
            </option>

            <option value="very noisy">
              Very noisy
            </option>
          </select>
        </div>

        <div className="filter-field">
          <label htmlFor="history-brightness">
            Brightness
          </label>

          <select
            id="history-brightness"
            value={filters.brightness}
            onChange={(event) =>
              setFilters({
                ...filters,
                brightness:
                  event.target.value,
              })
            }
          >
            <option value="">
              All brightness levels
            </option>

            <option value="dark">
              Dark
            </option>

            <option value="dim">
              Dim
            </option>

            <option value="normal">
              Normal
            </option>

            <option value="bright">
              Bright
            </option>

            <option value="very bright">
              Very bright
            </option>
          </select>
        </div>

        <div className="filter-field">
          <label htmlFor="minimum-temperature">
            Minimum temperature
          </label>

          <input
            id="minimum-temperature"
            type="number"
            step="0.1"
            placeholder="For example, 20"
            value={filters.minTemperature}
            onChange={(event) =>
              setFilters({
                ...filters,
                minTemperature:
                  event.target.value,
              })
            }
          />
        </div>

        <div className="filter-field">
          <label htmlFor="maximum-temperature">
            Maximum temperature
          </label>

          <input
            id="maximum-temperature"
            type="number"
            step="0.1"
            placeholder="For example, 30"
            value={filters.maxTemperature}
            onChange={(event) =>
              setFilters({
                ...filters,
                maxTemperature:
                  event.target.value,
              })
            }
          />
        </div>

        <div className="filter-field">
          <label htmlFor="history-sort">
            Sort by
          </label>

          <select
            id="history-sort"
            value={filters.sortBy}
            onChange={(event) =>
              setFilters({
                ...filters,
                sortBy:
                  event.target.value as
                    | "time"
                    | "temperature",
              })
            }
          >
            <option value="time">
              Time
            </option>

            <option value="temperature">
              Temperature
            </option>
          </select>
        </div>

        <div className="filter-field">
          <label htmlFor="history-order">
            Order
          </label>

          <select
            id="history-order"
            value={filters.sortOrder}
            onChange={(event) =>
              setFilters({
                ...filters,
                sortOrder:
                  event.target.value as
                    | "asc"
                    | "desc",
              })
            }
          >
            <option value="desc">
              Descending
            </option>

            <option value="asc">
              Ascending
            </option>
          </select>
        </div>

        <div className="filter-actions">
          <button
            className="primary-button"
            type="submit"
          >
            Apply filters
          </button>

          <button
            className="secondary-button"
            type="button"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </form>

      <section className="history-results">
        <div className="results-heading">
          <div>
            <p className="eyebrow">
              Results
            </p>

            <h2>
              {loading
                ? "Loading readings..."
                : `${readings.length} readings`}
            </h2>
          </div>
        </div>

        {error && (
          <div className="history-message error-message">
            <h3>
              Could not load readings
            </h3>

            <p>{error}</p>
          </div>
        )}

        {!error && loading && (
          <div className="history-message">
            <div className="loading-spinner" />

            <p>
              Loading measurement history...
            </p>
          </div>
        )}

        {!error &&
          !loading &&
          readings.length === 0 && (
            <div className="history-message">
              <h3>
                No matching readings
              </h3>

              <p>
                Try changing or resetting the
                filters.
              </p>
            </div>
          )}

        {!error &&
          !loading &&
          readings.length > 0 && (
            <>
              <div className="table-container">
                <table className="readings-table">
                  <thead>
                    <tr>
                      <th>
                        Date and time
                      </th>

                      <th>
                        Location
                      </th>

                      <th>
                        Temperature
                      </th>

                      <th>
                        Brightness
                      </th>

                      <th>
                        Noise
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {readings.map(
                      (reading) => {
                        const normalizedLocation =
                          normalizeLocation(
                            reading.location,
                          );

                        return (
                          <tr key={reading.id}>
                            <td>
                              {new Date(
                                reading.measured_at,
                              ).toLocaleString()}
                            </td>

                            <td>
                              <span
                                className={`location-badge location-${normalizedLocation}`}
                              >
                                {formatLocation(
                                  reading.location,
                                )}
                              </span>
                            </td>

                            <td>
                              <strong>
                                {
                                  reading.temperature
                                }
                                °C
                              </strong>
                            </td>

                            <td>
                              {formatCategory(
                                reading.brightness,
                              )}
                            </td>

                            <td>
                              {formatCategory(
                                reading.noise,
                              )}
                            </td>
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mobile-readings-list">
                {readings.map((reading) => {
                  const normalizedLocation =
                    normalizeLocation(
                      reading.location,
                    );

                  return (
                    <article
                      className="mobile-reading-card"
                      key={reading.id}
                    >
                      <div className="mobile-reading-header">
                        <span
                          className={`location-badge location-${normalizedLocation}`}
                        >
                          {formatLocation(
                            reading.location,
                          )}
                        </span>

                        <strong>
                          {reading.temperature}
                          °C
                        </strong>
                      </div>

                      <time>
                        {new Date(
                          reading.measured_at,
                        ).toLocaleString()}
                      </time>

                      <dl>
                        <div>
                          <dt>
                            Brightness
                          </dt>

                          <dd>
                            {formatCategory(
                              reading.brightness,
                            )}
                          </dd>
                        </div>

                        <div>
                          <dt>
                            Noise
                          </dt>

                          <dd>
                            {formatCategory(
                              reading.noise,
                            )}
                          </dd>
                        </div>
                      </dl>
                    </article>
                  );
                })}
              </div>
            </>
          )}
      </section>
    </main>
  );
}