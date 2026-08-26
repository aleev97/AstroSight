// Calculadora interactiva: el usuario ingresa su equipo (focal, apertura,
// sensor) y ve en vivo el tiempo de exposición máximo recomendado,

import { useState, useMemo } from 'react';
import { Camera } from 'lucide-react';
import { calculateExposure } from '../services/exposureCalculations';
import type { SensorType } from '../Types/Camera.types';

const SENSOR_OPTIONS: { value: SensorType; label: string }[] = [
  { value: 'full-frame', label: 'Full Frame' },
  { value: 'aps-c', label: 'APS-C' },
  { value: 'micro-4/3', label: 'Micro 4/3' },
];

export default function ExposureCalculator() {
  const [focalLength, setFocalLength] = useState(24);
  const [aperture, setAperture] = useState(2.8);
  const [sensorType, setSensorType] = useState<SensorType>('full-frame');

  // useMemo evita recalcular en cada render si los inputs no cambiaron;
  // acá el cálculo es liviano así que es más por buena práctica que por
  // necesidad real de performance.
  const result = useMemo(
    () => calculateExposure({ focalLength, aperture, sensorType }),
    [focalLength, aperture, sensorType]
  );

  return (
    <div className="bg-space-900 border border-space-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Camera size={18} className="text-nebula-500" />
        <p className="text-sm text-slate-400">
          Ingresá tu equipo para calcular el tiempo máximo de exposición sin trazado de estrellas.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Distancia focal */}
        <div>
          <label htmlFor="focal-length" className="block text-xs text-slate-500 mb-1.5">
            Distancia focal (mm)
          </label>
          <input
            id="focal-length"
            type="number"
            min={1}
            max={2000}
            value={focalLength}
            onChange={(e) => setFocalLength(Number(e.target.value) || 0)}
            className="w-full bg-space-800 border border-space-800 rounded-lg px-3 py-2
                       text-slate-100 focus:outline-none focus:ring-2 focus:ring-nebula-500"
          />
        </div>

        {/* Apertura */}
        <div>
          <label htmlFor="aperture" className="block text-xs text-slate-500 mb-1.5">
            Apertura máxima (f/)
          </label>
          <input
            id="aperture"
            type="number"
            min={0.7}
            max={22}
            step={0.1}
            value={aperture}
            onChange={(e) => setAperture(Number(e.target.value) || 0)}
            className="w-full bg-space-800 border border-space-800 rounded-lg px-3 py-2
                       text-slate-100 focus:outline-none focus:ring-2 focus:ring-nebula-500"
          />
        </div>

        {/* Tipo de sensor */}
        <div>
          <label htmlFor="sensor-type" className="block text-xs text-slate-500 mb-1.5">
            Tipo de sensor
          </label>
          <select
            id="sensor-type"
            value={sensorType}
            onChange={(e) => setSensorType(e.target.value as SensorType)}
            className="w-full bg-space-800 border border-space-800 rounded-lg px-3 py-2
                       text-slate-100 focus:outline-none focus:ring-2 focus:ring-nebula-500"
          >
            {SENSOR_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resultados */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-space-800">
        <div>
          <p className="text-xs text-slate-500 mb-1">Regla de los 500</p>
          <p className="text-2xl font-bold text-slate-300">{result.rule500Seconds}s</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Regla NPF (recomendada)</p>
          <p className="text-2xl font-bold text-star-400">{result.ruleNPFSeconds}s</p>
        </div>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed mt-4 bg-space-800/50 rounded-lg px-3 py-2">
        💡 {result.recommendation}
      </p>

      <p className="text-xs text-slate-600 mt-2">
        Focal efectiva (con crop factor): {result.effectiveFocalLength.toFixed(1)}mm
      </p>
    </div>
  );
}