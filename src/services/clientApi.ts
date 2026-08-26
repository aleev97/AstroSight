import type { WeatherData } from '../Types/Weather.types';
import type { AstronomyData } from '../Types/Astronomy.types';
import type { Location } from '../Types/location.types';
import type { AIRecommendationRequest, AIRecommendationResponse } from '../Types/ai.types';

/** Wrapper genérico que lanza un Error legible si la respuesta no es OK */
async function fetchJSON<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body?.error || `Error en la solicitud (${response.status})`);
  }

  return body as T;
}

export function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  return fetchJSON<WeatherData>(`/api/weather?lat=${lat}&lon=${lon}`);
}

export function fetchAstronomy(lat: number, lon: number): Promise<AstronomyData> {
  return fetchJSON<AstronomyData>(`/api/astronomy?lat=${lat}&lon=${lon}`);
}

export function searchLocationsClient(query: string): Promise<Location[]> {
  return fetchJSON<Location[]>(`/api/geocode?q=${encodeURIComponent(query)}`);
}

export async function fetchAIRecommendation(
  payload: AIRecommendationRequest
): Promise<AIRecommendationResponse> {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body?.error || `Error en la solicitud (${response.status})`);
  }

  return body as AIRecommendationResponse;
}