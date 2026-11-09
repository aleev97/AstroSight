interface RateLimitEntry {
  count: number;
  /** Timestamp (ms) en el que se reinicia el contador de esta clave */
  resetAt: number;
}

interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * Registra un intento para `key` y decide si se permite.
 * @param key Identificador del visitante (ej. "gemini:190.12.34.56")
 * @param maxRequests Máximo de requests permitidas por ventana
 * @param windowMs Duración de la ventana en milisegundos
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();

  // Limpieza oportunista: si el mapa crece mucho, borramos entradas vencidas
  // para que no consuma memoria indefinidamente.
  if (store.size > 1000) {
    for (const [k, entry] of store) {
      if (entry.resetAt <= now) store.delete(k);
    }
  }

  const entry = store.get(key);

  // Primera request, o la ventana anterior ya venció: arrancamos de cero
  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  // Ya alcanzó el máximo dentro de la ventana actual: bloqueamos
  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function getClientIp(request: Request, clientAddress?: string): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return clientAddress || 'unknown';
}