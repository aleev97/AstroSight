// Lógica de cálculo para determinar el tiempo de exposición máximo antes de
// que las estrellas empiecen a "trazar" (star trailing) por la rotación
// terrestre.
//
// - Regla de los 500: simple, aproximada. Tiempo = 500 / focal_efectiva
// - Regla NPF: más precisa, considera apertura y tamaño de pixel del sensor

import type {
  ExposureCalculatorInput,
  ExposureCalculatorResult,
  SensorType,
} from '../Types/Camera.types';

/**
 * Factor de recorte (crop factor) de cada tipo de sensor respecto a full frame.
 * Un sensor más chico "recorta" la imagen, lo que efectivamente multiplica
 * la distancia focal percibida — por eso importa para el cálculo.
 */
const CROP_FACTORS: Record<SensorType, number> = {
  'full-frame': 1,
  'aps-c': 1.5, // Aproximado; Canon usa 1.6, pero 1.5 es el estándar general
  'micro-4/3': 2,
};

/**
 * Tamaño de pixel promedio (en micras) por tipo de sensor, usado como
 * default razonable cuando el usuario no especifica el suyo exacto.
 * Son valores típicos de cámaras modernas de cada formato.
 */
const DEFAULT_PIXEL_PITCH: Record<SensorType, number> = {
  'full-frame': 5.9,
  'aps-c': 3.9,
  'micro-4/3': 3.3,
};

/**
 * Regla de los 500 (clásica y simple):
 * Tiempo máximo (segundos) = 500 / distancia_focal_efectiva
 */
function calculateRule500(effectiveFocalLength: number): number {
  return 500 / effectiveFocalLength;
}

/**
 * Regla NPF (más precisa, tiene en cuenta apertura y pixel pitch):
 * Tiempo = (35 * apertura + 30 * pixel_pitch) / focal_efectiva
 *
 * Es la fórmula estándar usada por apps de astrofotografía profesionales
 * (PhotoPills, etc.), que compensa mejor el "circulo de confusión" real
 * del sensor en vez de una aproximación genérica como la Regla de los 500.
 */
function calculateRuleNPF(
  aperture: number,
  pixelPitch: number,
  effectiveFocalLength: number
): number {
  return (35 * aperture + 30 * pixelPitch) / effectiveFocalLength;
}

/**
 * Punto de entrada principal: recibe los datos del equipo del usuario
 * y devuelve ambos cálculos junto con una recomendación textual.
 */
export function calculateExposure(
  input: ExposureCalculatorInput
): ExposureCalculatorResult {
  const { focalLength, aperture, sensorType } = input;
  const cropFactor = CROP_FACTORS[sensorType];
  const effectiveFocalLength = focalLength * cropFactor;

  const pixelPitch = input.pixelPitch ?? DEFAULT_PIXEL_PITCH[sensorType];

  const rule500Seconds = calculateRule500(effectiveFocalLength);
  const ruleNPFSeconds = calculateRuleNPF(aperture, pixelPitch, effectiveFocalLength);

  // La Regla NPF siempre es más estricta (da un tiempo menor) que la de los 500,
  // porque considera más variables físicas del sensor. Se la recomendamos
  // al usuario como la más confiable para resultados nítidos.
  const recommendation =
    ruleNPFSeconds < rule500Seconds
      ? `Usá la Regla NPF (${ruleNPFSeconds.toFixed(1)}s) para mayor precisión. La Regla de los 500 es más permisiva pero puede dejar leve trazado en encuadres grandes.`
      : `Ambas reglas dan resultados similares en este equipo; podés usar ${ruleNPFSeconds.toFixed(1)}s con confianza.`;

  return {
    rule500Seconds: Math.round(rule500Seconds * 10) / 10,
    ruleNPFSeconds: Math.round(ruleNPFSeconds * 10) / 10,
    effectiveFocalLength,
    recommendation,
  };
}