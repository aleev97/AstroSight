// Utilidades de cálculo astronómico de bajo nivel, usadas por astronomyService.
// Implementa fórmulas estándar de mecánica celeste para estimar la ventana
// de visibilidad del centro galáctico de la Vía Láctea (Sagitario A*).

import type { GalacticCoreData } from '../Types/Astronomy.types';

// Coordenadas ecuatoriales J2000 del centro galáctico
const GALACTIC_CORE_RA_DEG = 266.4168; // Ascensión recta: 17h 45m 40s
const GALACTIC_CORE_DEC_DEG = -29.00781; // Declinación: -29° 00' 47"

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

/** Convierte una fecha a Día Juliano (estándar astronómico) */
function toJulianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

/** Tiempo Sidéreo Medio de Greenwich (GMST) en grados, para una fecha dada */
function getGMSTDegrees(date: Date): number {
  const jd = toJulianDate(date);
  const daysSinceJ2000 = jd - 2451545.0;
  let gmst = 280.46061837 + 360.98564736629 * daysSinceJ2000;
  gmst = gmst % 360;
  return gmst < 0 ? gmst + 360 : gmst;
}

/**
 * Dada una fecha de referencia y un Tiempo Sidéreo Local (LST) objetivo,
 * encuentra el próximo instante en que se alcanza ese LST.
 * El día sidéreo (~23h56m) es ligeramente más corto que el día solar,
 * por eso el factor 360.9856235 grados/día en vez de 360.
 */
function findNextTimeForLST(referenceDate: Date, longitudeDeg: number, targetLSTDeg: number): Date {
  const currentGMST = getGMSTDegrees(referenceDate);
  const currentLST = (currentGMST + longitudeDeg + 360) % 360;
  const deltaDeg = (targetLSTDeg - currentLST + 360) % 360;
  const deltaDays = deltaDeg / 360.9856235;
  return new Date(referenceDate.getTime() + deltaDays * 86400000);
}

/**
 * Estima la ventana de visibilidad del centro galáctico para una ubicación/fecha.
 *
 * NOTA: Aproximación basada en cruce de horizonte (altitud 0°). Para fotografía
 * real se recomienda esperar a que el núcleo esté al menos 15-20° sobre el
 * horizonte para evitar extinción atmosférica excesiva — se lo indicamos al
 * usuario como nota, no como cálculo exacto.
 */
export function calculateGalacticCoreVisibility(
  date: Date,
  latDeg: number,
  lonDeg: number
): GalacticCoreData {
  const latRad = latDeg * DEG_TO_RAD;
  const decRad = GALACTIC_CORE_DEC_DEG * DEG_TO_RAD;

  // Ángulo horario en el horizonte (fórmula estándar de orto/ocaso)
  const cosH = -Math.tan(latRad) * Math.tan(decRad);

  // cosH > 1 → el objeto nunca sale sobre el horizonte en esta latitud
  if (cosH > 1) {
    return {
      isVisible: false,
      riseTime: null,
      setTime: null,
      seasonNote:
        'El centro galáctico no se eleva sobre el horizonte en esta latitud.',
    };
  }

  const isCircumpolar = cosH < -1; // siempre visible (raro, solo en latitudes extremas)
  const hourAngleDeg = isCircumpolar ? 180 : Math.acos(cosH) * RAD_TO_DEG;

  const riseLST = (GALACTIC_CORE_RA_DEG - hourAngleDeg + 360) % 360;
  const setLST = (GALACTIC_CORE_RA_DEG + hourAngleDeg) % 360;

  const riseTime = findNextTimeForLST(date, lonDeg, riseLST);
  const setTime = findNextTimeForLST(date, lonDeg, setLST);

  // Heurística estacional simplificada, apropiada para un MVP
  const isSouthernHemisphere = latDeg < 0;
  const month = date.getMonth(); // 0 = enero
  const inSeason = isSouthernHemisphere
    ? month >= 1 && month <= 9 // Febrero–Octubre (hemisferio sur)
    : month >= 2 && month <= 9; // Marzo–Octubre (hemisferio norte)

  const seasonNote = isSouthernHemisphere
    ? inSeason
      ? 'Temporada favorable en el hemisferio sur (Feb-Oct), con mejor visibilidad en otoño e invierno austral.'
      : 'Fuera de temporada óptima en el hemisferio sur.'
    : inSeason
      ? 'Temporada favorable en el hemisferio norte (Mar-Oct), con mejor visibilidad entre Junio y Agosto.'
      : 'Fuera de temporada óptima en el hemisferio norte.';

  return {
    isVisible: inSeason,
    riseTime: riseTime.toISOString(),
    setTime: setTime.toISOString(),
    seasonNote,
  };
}