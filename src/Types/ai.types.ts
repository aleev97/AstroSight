/** Payload que el cliente envía a nuestro endpoint /api/gemini */
export interface AIRecommendationRequest {
  locationName: string;
  weather: {
    cloudCoverage: number;
    humidity: number;
    windSpeed: number;
    visibility: number;
  };
  moonIllumination: number;
  equipment: {
    focalLength: number;
    aperture: number;
    sensorType: string;
  };
}

/** Respuesta estructurada que esperamos que Gemini devuelva (parseada desde JSON) */
export interface AIRecommendationResponse {
  /** Si la noche es óptima para fotografiar (evaluación general de Gemini) */
  isOptimalNight: boolean;
  /** ISO sugerido */
  suggestedISO: number;
  /** Tiempo de exposición sugerido en segundos */
  suggestedExposure: number;
  /** Técnica de enfoque nocturno recomendada */
  focusTechnique: string;
  /** Explicación/razonamiento en lenguaje natural */
  reasoning: string;
  /** Advertencias específicas (ej. "Nubes altas al 40%, considera esperar") */
  warnings: string[];
}