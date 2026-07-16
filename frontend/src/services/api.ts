import type {
  ComfortScore,
  CurrentState,
  Reading,
  ReadingFilters,
  Recommendation,
  Summary,
  Report,
  ReportCreate,
  ReportUpdate,
} from "../types/api";

const API_URL = "http://127.0.0.1:8000";

async function fetchJson<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<T>;
}

export function getSummary(
  selectedDate?: string,
): Promise<Summary> {
  const parameters = new URLSearchParams();

  if (selectedDate) {
    parameters.set("date", selectedDate);
  }

  const queryString = parameters.toString();

  const url = queryString
    ? `${API_URL}/summary?${queryString}`
    : `${API_URL}/summary`;

  return fetchJson<Summary>(url);
}

export function getComfortScore(): Promise<ComfortScore> {
  return fetchJson<ComfortScore>(`${API_URL}/comfort-score`);
}

export function getRecommendations(): Promise<Recommendation> {
  return fetchJson<Recommendation>(`${API_URL}/recommendations`);
}

export function getCurrentState(): Promise<CurrentState> {
  return fetchJson<CurrentState>(`${API_URL}/current`);
}

export function getReadings(
  filters: ReadingFilters = {},
): Promise<Reading[]> {
  const parameters = new URLSearchParams();

  if (filters.date) {
    parameters.set("date", filters.date);
  }

  if (filters.location) {
    parameters.set("location", filters.location);
  }

  if (filters.noise) {
    parameters.set("noise", filters.noise);
  }

  if (filters.brightness) {
    parameters.set("brightness", filters.brightness);
  }

  if (filters.minTemperature) {
    parameters.set(
      "min_temperature",
      filters.minTemperature,
    );
  }

  if (filters.maxTemperature) {
    parameters.set(
      "max_temperature",
      filters.maxTemperature,
    );
  }

  parameters.set(
    "sort_by",
    filters.sortBy ?? "time",
  );

  parameters.set(
    "sort_order",
    filters.sortOrder ?? "desc",
  );

  const queryString = parameters.toString();

  return fetchJson<Reading[]>(
    `${API_URL}/readings?${queryString}`,
  );
}

export function getReports(): Promise<Report[]> {
  return fetchJson<Report[]>(
    `${API_URL}/reports`,
  );
}

export function createReport(
  report: ReportCreate,
): Promise<Report> {
  return fetchJson<Report>(
    `${API_URL}/reports`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(report),
    },
  );
}

export function updateReport(
  reportId: number,
  update: ReportUpdate,
): Promise<Report> {
  return fetchJson<Report>(
    `${API_URL}/reports/${reportId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(update),
    },
  );
}

export async function deleteReport(
  reportId: number,
): Promise<void> {
  const response = await fetch(
    `${API_URL}/reports/${reportId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status} ${response.statusText}`,
    );
  }
}