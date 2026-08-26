// Endpoint que expone los cálculos astronómicos (fase lunar, sol, Vía Láctea).

import type { APIRoute } from 'astro';
import { getAstronomyData } from '../../services/astronomySerice';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const lat = url.searchParams.get('lat');
  const lon = url.searchParams.get('lon');
  // Fecha opcional en formato ISO; si no se pasa, usamos "ahora"
  const dateParam = url.searchParams.get('date');

  if (!lat || !lon) {
    return new Response(
      JSON.stringify({ error: 'Los parámetros lat y lon son requeridos.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);
  const date = dateParam ? new Date(dateParam) : new Date();

  if (Number.isNaN(latNum) || Number.isNaN(lonNum) || Number.isNaN(date.getTime())) {
    return new Response(
      JSON.stringify({ error: 'lat, lon o date inválidos.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const data = getAstronomyData(date, latNum, lonNum);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[api/astronomy] Error:', err);
    return new Response(
      JSON.stringify({ error: 'No se pudieron calcular los datos astronómicos.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};