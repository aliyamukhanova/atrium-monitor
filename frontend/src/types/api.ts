export interface Summary {
  date: string | null;
  average_temperature: number | null;
  minimum_temperature: number | null;
  maximum_temperature: number | null;
  total_readings: number;
  coolest_time: string | null;
  hottest_time: string | null;
}

export interface ComfortScore {
  comfort_score: number;
  status: string;
}

export interface Recommendation {
  best_study_time: string;
  recommended_location: string;
  comfort_score: number;
}

export interface CurrentState {
  atrium: {
    temperature: number;
    brightness: string | null;
    noise: string | null;
    measured_at: string;
  };

  outside: {
    temperature: number | null;
    measured_at: string | null;
  };

  status: string;
}

export interface Reading {
  id: number;
  measured_at: string;
  location: "atrium" | "outside";
  temperature: number;
  brightness: string | null;
  noise: string | null;
}

export interface ReadingFilters {
  date?: string;
  location?: "" | "atrium" | "outside";
  noise?: string;
  brightness?: string;
  minTemperature?: string;
  maxTemperature?: string;
  sortBy?: "time" | "temperature";
  sortOrder?: "asc" | "desc";
}

export type ReportCategory =
  | "too hot"
  | "too noisy"
  | "too bright"
  | "too dark"
  | "comfortable"
  | "other";

export type ReportStatus =
  | "open"
  | "resolved";

export interface Report {
  id: number;
  created_at: string;
  category: ReportCategory;
  comment: string | null;
  status: ReportStatus;
}

export interface ReportCreate {
  category: ReportCategory;
  comment?: string;
}

export interface ReportUpdate {
  category?: ReportCategory;
  comment?: string;
  status?: ReportStatus;
}

export interface ChartReading {
  id: number;
  time: string;
  hour: number;
  location: "atrium" | "outside";
  temperature: number;
  brightness: string | null;
  noise: string | null;
}