// búsqueda de ciudades por nombre.
import type { APIRoute } from 'astro';
import { searchLocations } from '../../services/geocodeService';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get('q');

  if (!query) {
    return new Response(
      JSON.stringify({ error: 'El parámetro q (búsqueda) es requerido.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const results = await searchLocations(query);
    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[api/geocode] Error:', err);
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return new Response(
      JSON.stringify({ error: 'No se pudo buscar la ubicación.', detail: message }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
};