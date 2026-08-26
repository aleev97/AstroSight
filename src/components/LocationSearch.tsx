// Buscador de ubicación con autocompletado por nombre de ciudad

import { useState, useCallback, useRef } from 'react';
import { MapPin, Search, Loader2, LocateFixed } from 'lucide-react';
import { searchLocationsClient } from '../services/clientApi';
import { useGeolocation } from '../hooks/useGeolocation';
import type { Location } from '../Types/location.types';

interface LocationSearchProps {
  onLocationSelected: (location: Location) => void;
}

export default function LocationSearch({ onLocationSelected }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isLoading: isLocating, error: geoError, requestLocation } = useGeolocation();

  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    setSearchError(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const locations = await searchLocationsClient(value);
        setResults(locations);
        if (locations.length === 0) {
          setSearchError('No se encontraron ubicaciones con ese nombre.');
        }
      } catch (err) {
        setSearchError(err instanceof Error ? err.message : 'Error al buscar.');
      } finally {
        setIsSearching(false);
      }
    }, 400);
  }, []);

  const handleSelect = useCallback(
    (location: Location) => {
      setQuery(`${location.name}${location.country ? `, ${location.country}` : ''}`);
      setResults([]);
      onLocationSelected(location);
    },
    [onLocationSelected]
  );

  const handleUseMyLocation = useCallback(async () => {
    try {
      const { lat, lon } = await requestLocation();
      setQuery('Mi ubicación actual');
      onLocationSelected({ name: 'Mi ubicación actual', lat, lon });
    } catch {
    }
  }, [requestLocation, onLocationSelected]);

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
            aria-hidden="true"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Buscar ciudad (ej. Mendoza, Argentina)"
            className="w-full bg-space-900 border border-space-800 rounded-lg pl-10 pr-4 py-3
                       text-slate-100 placeholder:text-slate-500
                       focus:outline-none focus:ring-2 focus:ring-nebula-500 focus:border-transparent
                       transition-shadow"
            aria-label="Buscar ubicación por nombre"
          />
          {isSearching && (
            <Loader2
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 animate-spin"
              size={18}
            />
          )}
        </div>

        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={isLocating}
          className="flex items-center gap-2 bg-space-900 border border-space-800 rounded-lg px-4 py-3
                     text-sm text-slate-300 hover:border-nebula-500/50 hover:text-star-400
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {isLocating ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <LocateFixed size={18} />
          )}
          <span className="hidden sm:inline">Mi ubicación</span>
        </button>
      </div>

      {/* Dropdown de resultados */}
      {results.length > 0 && (
        <ul
          className="absolute z-50 mt-2 w-full bg-space-900 border border-space-800 rounded-lg
                     shadow-xl overflow-hidden"
          role="listbox"
        >
          {results.map((loc, idx) => (
            <li key={`${loc.lat}-${loc.lon}-${idx}`}>
              <button
                type="button"
                onClick={() => handleSelect(loc)}
                className="w-full flex items-center gap-2 px-4 py-3 text-left text-sm
                           text-slate-200 hover:bg-space-800 transition-colors"
                role="option"
                aria-selected="false"
              >
                <MapPin size={16} className="text-nebula-500 shrink-0" />
                <span>
                  {loc.name}
                  {loc.country && <span className="text-slate-500">, {loc.country}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {(searchError || geoError) && (
        <p className="text-red-400 text-xs mt-2" role="alert">
          {searchError || geoError}
        </p>
      )}
    </div>
  );
}