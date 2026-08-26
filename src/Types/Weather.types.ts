/**
 * datos climáticos relevantes para una sesión de astrofotografía,*/
export interface WeatherData {
  locationName: string;
  /** Porcentaje de cobertura de nubes (0-100). Crítico: >50% arruina la sesión */
  cloudCoverage: number;
  humidity: number;
  temperature: number;
  feelsLike: number;
  /** Velocidad del viento en m/s (afecta estabilidad del trípode) */
  windSpeed: number;
  /** Visibilidad en metros (10000 = visibilidad máxima típica) */
  visibility: number;
  /** Descripción textual del clima */
  description: string;
  /** Código de icono de OpenWeatherMap para mostrar el ícono correspondiente */
  iconCode: string;
  /** Timestamp de cuándo se obtuvo el dato (para mostrar "actualizado hace X min") */
  fetchedAt: string;
}

/** Payload que el cliente envía a nuestro endpoint /api/weather */
export interface WeatherRequest {
  lat: number;
  lon: number;
}