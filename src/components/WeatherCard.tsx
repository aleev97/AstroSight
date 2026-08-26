import { RefreshCw } from 'lucide-react';
import { Skeleton } from './ui/Skeleton';
import type { WeatherData } from '../Types/Weather.types';

interface WeatherCardProps {
  data: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

function getCloudAssessment(cloudCoverage: number): { color: string; label: string } {
  if (cloudCoverage <= 20) return { color: 'text-emerald-400', label: 'Excelente' };
  if (cloudCoverage <= 50) return { color: 'text-amber-400', label: 'Parcial' };
  return { color: 'text-red-400', label: 'Desfavorable' };
}

export default function WeatherCard({ data, isLoading, error, onRetry }: WeatherCardProps) {
  return (
    <div className="bg-space-900 border border-space-800 rounded-xl p-5">
      <h3 className="text-sm font-medium text-slate-400 mb-3">☁️ Clima Nocturno</h3>

      {isLoading && (
        <div className="space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-4 w-28" />
          <div className="grid grid-cols-2 gap-y-2 pt-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-10 ml-auto" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-10 ml-auto" />
          </div>
        </div>
      )}

      {!isLoading && error && (
        <div className="space-y-3">
          <p className="text-red-400 text-sm">{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-star-400
                         bg-space-800 hover:bg-space-800/70 rounded-lg px-3 py-1.5 transition-colors"
            >
              <RefreshCw size={13} />
              Reintentar
            </button>
          )}
        </div>
      )}

      {!isLoading && !error && !data && (
        <p className="text-slate-500 text-sm">Buscá una ubicación para ver el clima.</p>
      )}

      {!isLoading && !error && data && (
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold text-slate-100">{data.temperature.toFixed(0)}°C</p>
            <span className={`text-sm font-medium ${getCloudAssessment(data.cloudCoverage).color}`}>
              {getCloudAssessment(data.cloudCoverage).label}
            </span>
          </div>

          <p className="text-slate-400 text-sm capitalize">{data.description}</p>

          <dl className="grid grid-cols-2 gap-y-1.5 text-xs text-slate-500 pt-1">
            <dt>Nubosidad</dt>
            <dd className="text-right text-slate-300">{data.cloudCoverage}%</dd>
            <dt>Humedad</dt>
            <dd className="text-right text-slate-300">{data.humidity}%</dd>
            <dt>Viento</dt>
            <dd className="text-right text-slate-300">{data.windSpeed.toFixed(1)} m/s</dd>
            <dt>Visibilidad</dt>
            <dd className="text-right text-slate-300">{(data.visibility / 1000).toFixed(1)} km</dd>
          </dl>
        </div>
      )}
    </div>
  );
}