/**
 * Fases lunares posibles, siguiendo la nomenclatura estándar astronómica.
 */
export type MoonPhaseName =
  | 'Luna Nueva'
  | 'Luna Creciente'
  | 'Cuarto Creciente'
  | 'Gibosa Creciente'
  | 'Luna Llena'
  | 'Gibosa Menguante'
  | 'Cuarto Menguante'
  | 'Luna Menguante';

/** Datos de la fase lunar*/
export interface MoonPhaseData {
  phaseName: MoonPhaseName;
  illumination: number;
  /** Valor crudo de fase de suncalc (0-1), útil para cálculos internos */
  phaseValue: number;
  moonrise: string | null;
  moonset: string | null;
}

/** Horarios solares clave para planificar la ventana de "cielo oscuro" */
export interface SunTimesData {
  sunrise: string;
  sunset: string;
  /** Inicio del crepúsculo astronómico vespertino (cielo verdaderamente oscuro) */
  duskAstronomical: string;
  /** Fin del crepúsculo astronómico matutino */
  dawnAstronomical: string;
}

/**
 * Ventana estimada de visibilidad del centro galáctico de la Vía Láctea.
 * Se calcula combinando la posición estacional aproximada + horas de oscuridad.
 */
export interface GalacticCoreData {
  /** Si el centro galáctico es visible en la fecha/ubicación consultada */
  isVisible: boolean;
  /** Hora estimada de salida sobre el horizonte (ISO string) */
  riseTime: string | null;
  /** Hora estimada de puesta (ISO string) */
  setTime: string | null;
  /** Nota contextual, ej. "Temporada óptima: Marzo-Octubre en hemisferio sur" */
  seasonNote: string;
}

/** Agregado de todos los datos astronómicos para una ubicación/fecha */
export interface AstronomyData {
  moonPhase: MoonPhaseData;
  sunTimes: SunTimesData;
  galacticCore: GalacticCoreData;
}