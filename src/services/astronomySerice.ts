// src/services/astronomyService.ts
// Calcula fase lunar, horarios solares y visibilidad de la Vía Láctea
// usando la librería suncalc + nuestras utilidades de astroMath.ts.
// A diferencia del clima, estos datos NO requieren API key ni llamada de red:
// son cálculos matemáticos puros basados en fecha + coordenadas.

import * as SunCalc from 'suncalc';
import type {
  AstronomyData,
  MoonPhaseData,
  MoonPhaseName,
  SunTimesData,
} from '../Types/Astronomy.types';
import { calculateGalacticCoreVisibility } from '../Utils/astroMath';

/** Convierte el valor crudo de fase (0-1) de suncalc a un nombre legible en español */
function getMoonPhaseName(phase: number): MoonPhaseName {
  if (phase < 0.03 || phase > 0.97) return 'Luna Nueva';
  if (phase < 0.22) return 'Luna Creciente';
  if (phase < 0.28) return 'Cuarto Creciente';
  if (phase < 0.47) return 'Gibosa Creciente';
  if (phase < 0.53) return 'Luna Llena';
  if (phase < 0.72) return 'Gibosa Menguante';
  if (phase < 0.78) return 'Cuarto Menguante';
  return 'Luna Menguante';
}

function getMoonPhaseData(date: Date, lat: number, lon: number): MoonPhaseData {
  const illumination = SunCalc.getMoonIllumination(date);
  const moonTimes = SunCalc.getMoonTimes(date, lat, lon);

  return {
    phaseName: getMoonPhaseName(illumination.phase),
    illumination: Math.round(illumination.fraction * 100),
    phaseValue: illumination.phase,
    // moonTimes.rise/set pueden ser undefined si la luna no sale/se pone ese día
    // (ej. es circumpolar o no aparece en esa ventana de 24hs)
    moonrise: moonTimes.rise ? moonTimes.rise.toISOString() : null,
    moonset: moonTimes.set ? moonTimes.set.toISOString() : null,
  };
}

function safeToISOString(date: Date | null | undefined): string | null {
  if (!date || Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function getSunTimesData(date: Date, lat: number, lon: number): SunTimesData {
  const times = SunCalc.getTimes(date, lat, lon);

  // En condiciones normales (no polares) estos valores siempre existen.
  // Usamos fallbacks solo para satisfacer a TypeScript y evitar crashes
  // en el caso extremo de latitudes muy altas (círculo polar).
  const sunrise = safeToISOString(times.sunrise);
  const sunset = safeToISOString(times.sunset);
  const duskAstronomical = safeToISOString(times.night);
  const dawnAstronomical = safeToISOString(times.nightEnd);

  return {
    sunrise: sunrise ?? date.toISOString(),
    sunset: sunset ?? date.toISOString(),
    duskAstronomical: duskAstronomical ?? date.toISOString(),
    dawnAstronomical: dawnAstronomical ?? date.toISOString(),
  };
}

/**
 * Punto de entrada principal: agrega fase lunar, horarios solares
 * y visibilidad del centro galáctico en un solo objeto.
 */
export function getAstronomyData(date: Date, lat: number, lon: number): AstronomyData {
  return {
    moonPhase: getMoonPhaseData(date, lat, lon),
    sunTimes: getSunTimesData(date, lat, lon),
    galacticCore: calculateGalacticCoreVisibility(date, lat, lon),
  };
}