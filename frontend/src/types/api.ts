export interface Summary {
  average_temperature: number;
  minimum_temperature: number;
  maximum_temperature: number;
  total_readings: number;
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