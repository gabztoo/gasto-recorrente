/**
 * Rate Limiting Service
 * Protege contra abuso de API limitando requisições por IP
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Em produção, use Redis ou similar para distribuir entre instâncias
const requestCounts = new Map<string, RateLimitEntry>();

// Limpa entradas expiradas a cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of requestCounts.entries()) {
    if (now > entry.resetTime) {
      requestCounts.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // Janela de tempo em milissegundos
}

export const rateLimitService = {
  /**
   * Verifica se IP atingiu limite de requisições
   * @param identifier - Identificador único (geralmente IP)
   * @param config - Configuração de limite
   * @returns true se permitido, false se bloqueado
   */
  checkLimit: (identifier: string, config: RateLimitConfig): boolean => {
    const now = Date.now();
    const entry = requestCounts.get(identifier);

    // Primeira requisição ou janela expirada
    if (!entry || now > entry.resetTime) {
      requestCounts.set(identifier, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return true;
    }

    // Ainda dentro da janela
    if (entry.count < config.maxRequests) {
      entry.count++;
      return true;
    }

    // Limite atingido
    return false;
  },

  /**
   * Retorna informações sobre o limite para um identificador
   */
  getInfo: (identifier: string, config: RateLimitConfig) => {
    const entry = requestCounts.get(identifier);
    const now = Date.now();

    if (!entry || now > entry.resetTime) {
      return {
        remaining: config.maxRequests,
        resetIn: config.windowMs
      };
    }

    return {
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetIn: entry.resetTime - now
    };
  },

  /**
   * Reseta contador para um identificador
   */
  reset: (identifier: string) => {
    requestCounts.delete(identifier);
  }
};

/**
 * Extrai IP da requisição HTTP
 * Considera proxies e load balancers (Vercel, Cloudflare, etc)
 */
export const getClientIP = (req: any): string => {
  // Headers comuns de proxies
  const forwarded = req.headers['x-forwarded-for'];
  const realIP = req.headers['x-real-ip'];
  const cfConnectingIP = req.headers['cf-connecting-ip']; // Cloudflare

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback para conexão direta
  return req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown';
};
