import { GoogleGenAI } from '@google/genai';
import type {
  AIRecommendationRequest,
  AIRecommendationResponse,
} from '../Types/ai.types';

function buildPrompt(input: AIRecommendationRequest): string {
  return `Eres un experto en astrofotografía. Analiza estas condiciones y equipo, y devuelve SOLO un objeto JSON (sin markdown, sin backticks, sin texto adicional) con esta forma exacta:

{
  "isOptimalNight": boolean,
  "suggestedISO": number,
  "suggestedExposure": number,
  "focusTechnique": string,
  "reasoning": string,
  "warnings": string[]
}

DATOS DE LA SESIÓN:
- Ubicación: ${input.locationName}
- Cobertura de nubes: ${input.weather.cloudCoverage}%
- Humedad: ${input.weather.humidity}%
- Velocidad del viento: ${input.weather.windSpeed} m/s
- Visibilidad: ${input.weather.visibility} metros
- Iluminación lunar: ${input.moonIllumination}%

EQUIPO:
- Distancia focal: ${input.equipment.focalLength}mm
- Apertura: f/${input.equipment.aperture}
- Sensor: ${input.equipment.sensorType}

Instrucciones para tu análisis:
- Si la cobertura de nubes es mayor a 60%, la noche NO es óptima.
- Si la iluminación lunar es mayor a 70%, advierte que puede opacar detalles del cielo profundo.
- El ISO sugerido debe ser razonable para el equipo (no recomiendes ISO extremos sin justificación).
- La técnica de enfoque debe ser específica (ej. "enfoque manual en modo live view sobre una estrella brillante, con magnificación 10x").
- Responde en español.
- Recuerda: SOLO el JSON, nada más.`;
}

/**
 * Limpia la respuesta cruda de Gemini por si viene envuelta en markdown
 * (```json ... ```).
 */
function extractJSON(rawText: string): string {
  return rawText.replace(/```json\s*|```\s*/g, '').trim();
}

export async function getAIRecommendation(
  input: AIRecommendationRequest
): Promise<AIRecommendationResponse> {
  const apiKey = import.meta.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY no está configurada. Revisa tu archivo .env.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: buildPrompt(input),
  });

  const rawText = response.text;

  if (!rawText) {
    throw new Error('Gemini no devolvió contenido en la respuesta.');
  }

  let parsed: AIRecommendationResponse;
  try {
    parsed = JSON.parse(extractJSON(rawText));
  } catch (err) {
    console.error('[geminiService] Respuesta no parseable:', rawText);
    throw new Error('La respuesta de Gemini no tuvo el formato JSON esperado.');
  }

  // Validación mínima de forma, para no propagar un objeto corrupto a la UI
  if (
    typeof parsed.isOptimalNight !== 'boolean' ||
    typeof parsed.suggestedISO !== 'number' ||
    typeof parsed.suggestedExposure !== 'number'
  ) {
    throw new Error('La respuesta de Gemini no tiene los campos esperados.');
  }

  return parsed;
}