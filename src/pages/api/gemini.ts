import type { APIRoute } from 'astro';
import { getAIRecommendation } from '../../services/geminiService';
import { checkRateLimit, getClientIp } from '../../services/rateLimit';
import type { AIRecommendationRequest } from '../../types/ai.types';

export const prerender = false;

// Máximo 5 consultas por IP cada 10 minutos
const MAX_REQUESTS = 5;
const WINDOW_MS = 10 * 60 * 1000;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // 1. Rate limiting: lo primero, antes de gastar nada de la cuota de Gemini
  let ip = 'unknown';
  try {
    ip = getClientIp(request, clientAddress);
  } catch {
    // Si no se puede determinar la IP, usamos 'unknown' (queda en un cupo compartido)
  }

  const limit = checkRateLimit(`gemini:${ip}`, MAX_REQUESTS, WINDOW_MS);

  if (!limit.allowed) {
    const minutes = Math.ceil(limit.retryAfterSeconds / 60);
    return new Response(
      JSON.stringify({
        error: `Alcanzaste el límite de consultas. Probá de nuevo en ${minutes} minuto${minutes === 1 ? '' : 's'}.`,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(limit.retryAfterSeconds),
        },
      }
    );
  }

  // 2. Validación del body
  let body: AIRecommendationRequest;

  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'El cuerpo de la solicitud no es JSON válido.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

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

  // 3. Llamada a Gemini
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