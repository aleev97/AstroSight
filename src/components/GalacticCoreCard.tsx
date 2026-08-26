import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from './ui/Skeleton';
import type { GalacticCoreData } from '../Types/Astronomy.types';

interface GalacticCoreCardProps {
  data: GalacticCoreData | null;
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

export default function GalacticCoreCard({ data, isLoading }: GalacticCoreCardProps) {
  return (
    <div className="bg-space-900 border border-space-800 rounded-xl p-5">
      <h3 className="text-sm font-medium text-slate-400 mb-3">✨ Centro Galáctico</h3>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {!isLoading && !data && (
        <p className="text-slate-500 text-sm">Buscá una ubicación para ver los datos.</p>
      )}

      {!isLoading && data && (
        <div className="space-y-3">
          <p className={`text-lg font-bold ${data.isVisible ? 'text-emerald-400' : 'text-slate-500'}`}>
            {data.isVisible ? 'Visible esta temporada' : 'Fuera de temporada'}
          </p>

          <div className="flex justify-between text-xs text-slate-500">
            <span>↑ Sale: {formatLocalTime(data.riseTime)}</span>
            <span>↓ Se pone: {formatLocalTime(data.setTime)}</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed pt-1 border-t border-space-800">
            {data.seasonNote}
          </p>
        </div>
      )}
    </div>
  );
}