import type { APIRoute } from 'astro';
import { fetchWeatherData } from '../../services/weatherService';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const lat = url.searchParams.get('lat');
  const lon = url.searchParams.get('lon');

  if (!lat || !lon) {
    return new Response(
      JSON.stringify({ error: 'Los parámetros lat y lon son requeridos.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);

  if (Number.isNaN(latNum) || Number.isNaN(lonNum)) {
    return new Response(
      JSON.stringify({ error: 'lat y lon deben ser números válidos.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const data = await fetchWeatherData(latNum, lonNum);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[api/weather] Error:', err);
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return new Response(
      JSON.stringify({ error: 'No se pudo obtener el clima.', detail: message }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
};