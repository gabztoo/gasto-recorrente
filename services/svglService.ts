// Serviço para buscar ícones SVG das marcas via API SVGL
// https://svgl.app

const SVGL_API_BASE = 'https://api.svgl.app';

export interface SVGLIcon {
  id: number;
  title: string;
  category: string | string[];
  route: string | { dark: string; light: string };
  url: string;
  wordmark?: string | { dark: string; light: string };
  brandUrl?: string;
}

// Cache para evitar requisições repetidas
const iconCache: Map<string, string | null> = new Map();

// Mapeamento de nomes de serviços para termos de busca no SVGL
const SERVICE_SEARCH_TERMS: Record<string, string> = {
  'netflix': 'netflix',
  'spotify': 'spotify',
  'disney': 'disney',
  'disney+': 'disney',
  'amazon': 'amazon',
  'prime': 'amazon',
  'hbo': 'hbo',
  'hbo max': 'hbo',
  'adobe': 'adobe',
  'microsoft': 'microsoft',
  'office': 'microsoft',
  '365': 'microsoft',
  'google': 'google',
  'apple': 'apple',
  'icloud': 'apple',
  'youtube': 'youtube',
  'chatgpt': 'openai',
  'openai': 'openai',
  'smart fit': 'smartfit',
  'gympass': 'gympass',
  'uber': 'uber',
  'ifood': 'ifood',
  'rappi': 'rappi',
  'figma': 'figma',
  'canva': 'canva',
  'slack': 'slack',
  'notion': 'notion',
  'dropbox': 'dropbox',
  'twitch': 'twitch',
  'steam': 'steam',
  'epic': 'epic games',
  'xbox': 'xbox',
  'playstation': 'playstation',
  'psn': 'playstation',
  'github': 'github',
  'gitlab': 'gitlab',
  'vercel': 'vercel',
  'aws': 'aws',
  'cloudflare': 'cloudflare',
  'stripe': 'stripe',
  'tinder': 'tinder',
  'bumble': 'bumble',
  'linkedin': 'linkedin',
  'twitter': 'twitter',
  'x': 'x',
  'instagram': 'instagram',
  'facebook': 'facebook',
  'meta': 'meta',
  'whatsapp': 'whatsapp',
  'telegram': 'telegram',
  'discord': 'discord',
  'zoom': 'zoom',
  'udemy': 'udemy',
  'coursera': 'coursera',
  'duolingo': 'duolingo',
};

/**
 * Busca o ícone SVG de um serviço pelo nome
 */
export async function fetchServiceIcon(serviceName: string): Promise<string | null> {
  const normalizedName = serviceName.toLowerCase().trim();
  
  // Verifica cache
  if (iconCache.has(normalizedName)) {
    return iconCache.get(normalizedName) || null;
  }
  
  // Encontra termo de busca
  let searchTerm = normalizedName;
  for (const [key, value] of Object.entries(SERVICE_SEARCH_TERMS)) {
    if (normalizedName.includes(key)) {
      searchTerm = value;
      break;
    }
  }
  
  try {
    const response = await fetch(`${SVGL_API_BASE}?search=${encodeURIComponent(searchTerm)}`);
    
    if (!response.ok) {
      iconCache.set(normalizedName, null);
      return null;
    }
    
    const results: SVGLIcon[] = await response.json();
    
    if (results.length === 0) {
      iconCache.set(normalizedName, null);
      return null;
    }
    
    // Pega o primeiro resultado
    const icon = results[0];
    
    // Resolve a URL do ícone (preferindo dark mode para nosso tema escuro)
    let iconUrl: string;
    if (typeof icon.route === 'string') {
      iconUrl = icon.route;
    } else {
      iconUrl = icon.route.dark || icon.route.light;
    }
    
    iconCache.set(normalizedName, iconUrl);
    return iconUrl;
    
  } catch (error) {
    console.error(`Erro ao buscar ícone para ${serviceName}:`, error);
    iconCache.set(normalizedName, null);
    return null;
  }
}

/**
 * Busca ícones para múltiplos serviços em paralelo
 */
export async function fetchMultipleIcons(serviceNames: string[]): Promise<Map<string, string | null>> {
  const results = new Map<string, string | null>();
  
  const promises = serviceNames.map(async (name) => {
    const icon = await fetchServiceIcon(name);
    results.set(name.toLowerCase(), icon);
  });
  
  await Promise.all(promises);
  
  return results;
}

/**
 * Limpa o cache de ícones
 */
export function clearIconCache(): void {
  iconCache.clear();
}
