// src/components/MoonPhaseCard.tsx

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from './ui/Skeleton';
import MoonPhaseIcon from './MoonPhaseIcon';
import type { MoonPhaseData } from '../Types/Astronomy.types';

interface MoonPhaseCardProps {
  data: MoonPhaseData | null;
  isLoading: boolean;
}

function formatLocalTime(iso: string | null): string {
  if (!iso) return '—';
  try {
    return format(new Date(iso), 'HH:mm', { locale: es });
  } catch {
    return '—';
  }
}

export default function MoonPhaseCard({ data, isLoading }: MoonPhaseCardProps) {
  return (
    <div className="bg-space-900 border border-space-800 rounded-xl p-5">
      <h3 className="text-sm font-medium text-slate-400 mb-3">🌙 Fase Lunar</h3>

      {isLoading && (
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <Skeleton className="h-2 w-full" />
          <div className="flex justify-between pt-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      )}

      {!isLoading && !data && (
        <p className="text-slate-500 text-sm">Buscá una ubicación para ver los datos.</p>
      )}

      {!isLoading && data && (
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <MoonPhaseIcon phaseValue={data.phaseValue} size={56} />
            <div>
              <p className="text-xl font-bold text-star-400">{data.phaseName}</p>
              <p className="text-slate-400 text-sm">{data.illumination}% de iluminación</p>
            </div>
          </div>

          <div className="w-full h-2 bg-space-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-star-400 transition-all duration-500"
              style={{ width: `${data.illumination}%` }}
              role="progressbar"
              aria-valuenow={data.illumination}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          <div className="flex justify-between text-xs text-slate-500 pt-1">
            <span>🌕 Sale: {formatLocalTime(data.moonrise)}</span>
            <span>🌑 Se pone: {formatLocalTime(data.moonset)}</span>
          </div>

          {data.illumination > 50 && (
            <p className="text-xs text-amber-400/80 bg-amber-400/10 rounded-md px-2 py-1.5">
              ⚠️ Alta iluminación lunar: puede opacar objetos débiles del cielo profundo.
            </p>
          )}
        </div>
      )}
    </div>
  );
}