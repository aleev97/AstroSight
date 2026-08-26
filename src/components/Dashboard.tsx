import { useState, useCallback } from 'react';
import LocationSearch from './LocationSearch';
import MoonPhaseCard from './MoonPhaseCard';
import WeatherCard from './WeatherCard';
import GalacticCoreCard from './GalacticCoreCard';
import AIAssistant from './AiAssistant';
import { fetchWeather, fetchAstronomy } from '../services/clientApi';
import type { Location } from '../Types/location.types';
import type { WeatherData } from '../Types/Weather.types';
import type { AstronomyData } from '../Types/Astronomy.types';

export default function Dashboard() {
  const [location, setLocation] = useState<Location | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [astronomy, setAstronomy] = useState<AstronomyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const loadDataForLocation = useCallback(async (loc: Location) => {
    setIsLoading(true);
    setWeatherError(null);

    const [weatherResult, astronomyResult] = await Promise.allSettled([
      fetchWeather(loc.lat, loc.lon),
      fetchAstronomy(loc.lat, loc.lon),
    ]);

    if (weatherResult.status === 'fulfilled') {
      setWeather(weatherResult.value);
    } else {
      setWeatherError(weatherResult.reason?.message || 'No se pudo cargar el clima.');
      setWeather(null);
    }

    if (astronomyResult.status === 'fulfilled') {
      setAstronomy(astronomyResult.value);
    } else {
      setAstronomy(null);
    }

    setIsLoading(false);
  }, []);

  const handleLocationSelected = useCallback(
    (loc: Location) => {
      setLocation(loc);
      loadDataForLocation(loc);
    },
    [loadDataForLocation]
  );

  // Reintenta la carga para la ubicación ya seleccionada, sin pedirle
  // al usuario que la vuelva a buscar desde cero.
  const handleRetry = useCallback(() => {
    if (location) {
      loadDataForLocation(location);
    }
  }, [location, loadDataForLocation]);

  return (
  <div className="space-y-14">
    <section aria-labelledby="location-heading">
      <h2 id="location-heading" className="sr-only">
        Buscar ubicación
      </h2>
      <LocationSearch onLocationSelected={handleLocationSelected} />
    </section>

    <section aria-labelledby="dashboard-heading" className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <h2 id="dashboard-heading" className="sr-only">
        Dashboard astronómico y climático
      </h2>

      <MoonPhaseCard data={astronomy?.moonPhase ?? null} isLoading={isLoading} />
      <WeatherCard data={weather} isLoading={isLoading} error={weatherError} onRetry={handleRetry} />
      <GalacticCoreCard data={astronomy?.galacticCore ?? null} isLoading={isLoading} />
    </section>

    <section aria-labelledby="ai-heading">
      <h2 id="ai-heading" className="text-lg font-semibold text-slate-200 mb-4">
        🤖 Asistente IA
      </h2>
      <AIAssistant
        locationName={location?.name ?? null}
        weather={weather}
        moonIllumination={astronomy?.moonPhase.illumination ?? null}
      />
    </section>
  </div>
);
}