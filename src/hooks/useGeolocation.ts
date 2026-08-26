import { useState, useCallback } from 'react';

interface GeolocationState {
  isLoading: boolean;
  error: string | null;
}

interface UseGeolocationReturn extends GeolocationState {
  /** Solicita la ubicación; devuelve una promesa con lat/lon o rechaza con error legible */
  requestLocation: () => Promise<{ lat: number; lon: number }>;
}

export function useGeolocation(): UseGeolocationReturn {
  const [state, setState] = useState<GeolocationState>({
    isLoading: false,
    error: null,
  });

  const requestLocation = useCallback((): Promise<{ lat: number; lon: number }> => {
    setState({ isLoading: true, error: null });

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const msg = 'Tu navegador no soporta geolocalización.';
        setState({ isLoading: false, error: msg });
        reject(new Error(msg));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setState({ isLoading: false, error: null });
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (err) => {
          // Traducimos los códigos de error nativos a mensajes legibles en español
          const messages: Record<number, string> = {
            1: 'Permiso de ubicación denegado. Habilítalo en la configuración del navegador.',
            2: 'No se pudo determinar tu ubicación.',
            3: 'La solicitud de ubicación tardó demasiado.',
          };
          const msg = messages[err.code] || 'Error al obtener la ubicación.';
          setState({ isLoading: false, error: msg });
          reject(new Error(msg));
        },
        { timeout: 10000 }
      );
    });
  }, []);

  return { ...state, requestLocation };
}