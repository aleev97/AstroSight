import type { APIRoute } from 'astro';
import { getAIRecommendation } from '../../services/geminiService';
import type { AIRecommendationRequest } from '../../Types/ai.types';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let body: AIRecommendationRequest;

  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'El cuerpo de la solicitud no es JSON válido.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Validación básica de que llegaron los campos mínimos necesarios
  if (
    !body?.locationName ||
    !body?.weather ||
    !body?.equipment ||
    typeof body.moonIllumination !== 'number'
  ) {
    return new Response(
      JSON.stringify({ error: 'Faltan datos requeridos (ubicación, clima, luna o equipo).' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const recommendation = await getAIRecommendation(body);
    return new Response(JSON.stringify(recommendation), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[api/gemini] Error:', err);
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return new Response(
      JSON.stringify({ error: 'No se pudo obtener la recomendación de IA.', detail: message }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
};