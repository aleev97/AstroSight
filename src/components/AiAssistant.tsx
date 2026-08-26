// Módulo donde el usuario dispara la consulta a Gemini con los datos
// actuales de clima/ubicación (recibidos como props desde Dashboard)
// y el equipo que ingresó en la calculadora.

import { useState } from 'react';
import { Sparkles, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { fetchAIRecommendation } from '../services/clientApi';
import type { WeatherData } from '../Types/Weather.types';
import type { AIRecommendationResponse } from '../Types/ai.types';
import type { SensorType } from '../Types/Camera.types';

interface AIAssistantProps {
  locationName: string | null;
  weather: WeatherData | null;
  moonIllumination: number | null;
}

const SENSOR_OPTIONS: { value: SensorType; label: string }[] = [
  { value: 'full-frame', label: 'Full Frame' },
  { value: 'aps-c', label: 'APS-C' },
  { value: 'micro-4/3', label: 'Micro 4/3' },
];

export default function AIAssistant({ locationName, weather, moonIllumination }: AIAssistantProps) {
  const [focalLength, setFocalLength] = useState(24);
  const [aperture, setAperture] = useState(2.8);
  const [sensorType, setSensorType] = useState<SensorType>('full-frame');

  const [result, setResult] = useState<AIRecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasRequiredData = locationName && weather && moonIllumination !== null;

  const handleAsk = async () => {
    if (!hasRequiredData || !weather) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const recommendation = await fetchAIRecommendation({
        locationName,
        weather: {
          cloudCoverage: weather.cloudCoverage,
          humidity: weather.humidity,
          windSpeed: weather.windSpeed,
          visibility: weather.visibility,
        },
        moonIllumination: moonIllumination ?? 0,
        equipment: { focalLength, aperture, sensorType },
      });
      setResult(recommendation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al consultar la IA.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-nebula-500/10 to-space-900 border border-nebula-500/30 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={18} className="text-nebula-400" />
        <p className="text-sm text-slate-300">
          Consultá a la IA por una recomendación técnica según el clima actual y tu equipo.
        </p>
      </div>

      {!hasRequiredData && (
        <p className="text-slate-500 text-sm bg-space-900/50 rounded-lg px-3 py-2">
          Primero buscá una ubicación en el dashboard de arriba para habilitar el asistente.
        </p>
      )}

      {hasRequiredData && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="ai-focal" className="block text-xs text-slate-500 mb-1.5">
                Distancia focal (mm)
              </label>
              <input
                id="ai-focal"
                type="number"
                value={focalLength}
                onChange={(e) => setFocalLength(Number(e.target.value) || 0)}
                className="w-full bg-space-800 border border-space-800 rounded-lg px-3 py-2
                           text-slate-100 focus:outline-none focus:ring-2 focus:ring-nebula-500"
              />
            </div>
            <div>
              <label htmlFor="ai-aperture" className="block text-xs text-slate-500 mb-1.5">
                Apertura (f/)
              </label>
              <input
                id="ai-aperture"
                type="number"
                step={0.1}
                value={aperture}
                onChange={(e) => setAperture(Number(e.target.value) || 0)}
                className="w-full bg-space-800 border border-space-800 rounded-lg px-3 py-2
                           text-slate-100 focus:outline-none focus:ring-2 focus:ring-nebula-500"
              />
            </div>
            <div>
              <label htmlFor="ai-sensor" className="block text-xs text-slate-500 mb-1.5">
                Sensor
              </label>
              <select
                id="ai-sensor"
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

          <button
            type="button"
            onClick={handleAsk}
            disabled={isLoading}
            className="flex items-center gap-2 bg-nebula-500 hover:bg-nebula-600 text-white
                       font-medium rounded-lg px-4 py-2.5 text-sm transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Analizando condiciones...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Obtener recomendación
              </>
            )}
          </button>
        </>
      )}

      {error && (
        <p className="text-red-400 text-sm mt-4 flex items-center gap-2" role="alert">
          <AlertTriangle size={16} />
          {error}
        </p>
      )}

      {result && (
        <div className="mt-5 pt-5 border-t border-nebula-500/20 space-y-4">
          <div className="flex items-center gap-2">
            {result.isOptimalNight ? (
              <CheckCircle2 size={20} className="text-emerald-400" />
            ) : (
              <AlertTriangle size={20} className="text-amber-400" />
            )}
            <p className={`font-semibold ${result.isOptimalNight ? 'text-emerald-400' : 'text-amber-400'}`}>
              {result.isOptimalNight ? 'Noche óptima para fotografiar' : 'Condiciones no ideales'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500">ISO sugerido</p>
              <p className="text-xl font-bold text-star-400">{result.suggestedISO}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Exposición sugerida</p>
              <p className="text-xl font-bold text-star-400">{result.suggestedExposure}s</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-1">Técnica de enfoque</p>
            <p className="text-sm text-slate-300">{result.focusTechnique}</p>
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-1">Análisis</p>
            <p className="text-sm text-slate-300 leading-relaxed">{result.reasoning}</p>
          </div>

          {result.warnings.length > 0 && (
            <div className="space-y-1.5">
              {result.warnings.map((warning, idx) => (
                <p
                  key={idx}
                  className="text-xs text-amber-400/90 bg-amber-400/10 rounded-md px-2 py-1.5 flex items-start gap-1.5"
                >
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  {warning}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}