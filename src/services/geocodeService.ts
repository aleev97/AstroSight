import type { Location } from '../Types/location.types';

const GEOCODE_BASE_URL = 'https://api.openweathermap.org/geo/1.0/direct';

/**
 * Busca hasta 5 coincidencias de ubicación para un texto de búsqueda dado.
 * Ej: "Mendoza" puede devolver Mendoza (Argentina), Mendoza (España), etc.
 */
export async function searchLocations(query: string): Promise<Location[]> {
  const apiKey = import.meta.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENWEATHER_API_KEY no está configurada.');
  }

  if (!query || query.trim().length < 2) {
    return [];
  }

  const url = `${GEOCODE_BASE_URL}?q=${encodeURIComponent(query)}&limit=5&appid=${apiKey}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Geocoding API respondió con status ${response.status}`);
  }

  const raw = await response.json();

  // raw es un array de resultados crudos de OpenWeatherMap
  return raw.map((item: any) => ({
    name: item.local_names?.es || item.name,
    lat: item.lat,
    lon: item.lon,
    country: item.country,
  }));
}