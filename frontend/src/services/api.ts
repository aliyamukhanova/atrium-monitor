import type {
  Summary,
  ComfortScore,
  Recommendation,
} from "../types/api";

const API_URL = "http://127.0.0.1:8000";

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}

export function getSummary(): Promise<Summary> {
  return fetchJson<Summary>(`${API_URL}/summary`);
}

export function getComfortScore(): Promise<ComfortScore> {
  return fetchJson<ComfortScore>(`${API_URL}/comfort-score`);
}

export function getRecommendations(): Promise<Recommendation> {
  return fetchJson<Recommendation>(`${API_URL}/recommendations`);
}