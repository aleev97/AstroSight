/** Tipos de sensor soportados, cada uno con un "crop factor" distinto */
export type SensorType = 'full-frame' | 'aps-c' | 'micro-4/3';

/** Input del usuario para la calculadora de exposición (Regla NPF/500) */
export interface ExposureCalculatorInput {
  /** Distancia focal del lente en milímetros */
  focalLength: number;
  /** Apertura máxima, ej. 2.8 para f/2.8 */
  aperture: number;
  /** Tipo de sensor de la cámara */
  sensorType: SensorType;
  /** Tamaño del pixel en micras (opcional, para regla NPF avanzada) */
  pixelPitch?: number;
}

/** Resultado calculado de tiempo de exposición máximo */
export interface ExposureCalculatorResult {
  /** Tiempo máximo en segundos usando la Regla de los 500 (simple) */
  rule500Seconds: number;
  /** Tiempo máximo en segundos usando la Regla NPF (más precisa) */
  ruleNPFSeconds: number;
  /** Distancia focal efectiva considerando el crop factor del sensor */
  effectiveFocalLength: number;
  /** Recomendación textual sobre cuál regla usar y por qué */
  recommendation: string;
}