import type { WeatherData } from '../Types/Weather.types';

const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData> {
  const apiKey = import.meta.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    throw new Error(
      'OPENWEATHER_API_KEY no está configurada. Revisa tu archivo .env.'
    );
  }

  const url = `${OPENWEATHER_BASE_URL}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`;

  const response = await fetch(url);

  if (!response.ok) {
    // Distinguimos errores comunes para facilitar el debugging
    if (response.status === 401) {
      throw new Error('API key de OpenWeatherMap inválida o aún no activada.');
    }
    throw new Error(`OpenWeatherMap respondió con status ${response.status}`);
  }

  const raw = await response.json();

  // Normalizamos la respuesta cruda de la API a nuestro tipo interno.
  // Esto es clave: si el día de mañana cambiamos de proveedor de clima,
  // solo tocamos este archivo, no el resto de la app.
  const weatherData: WeatherData = {
    locationName: raw.name || 'Ubicación desconocida',
    cloudCoverage: raw.clouds?.all ?? 0,
    humidity: raw.main?.humidity ?? 0,
    temperature: raw.main?.temp ?? 0,
    feelsLike: raw.main?.feels_like ?? 0,
    windSpeed: raw.wind?.speed ?? 0,
    visibility: raw.visibility ?? 0,
    description: raw.weather?.[0]?.description ?? 'Sin datos',
    iconCode: raw.weather?.[0]?.icon ?? '01n',
    fetchedAt: new Date().toISOString(),
  };

  return weatherData;
}