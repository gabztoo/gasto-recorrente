// Serviço de alternativas para cancelar assinaturas
// Sugere opções gratuitas ou mais baratas

export interface Alternative {
  name: string;
  type: 'free' | 'cheaper' | 'tip';
  description: string;
  url?: string;
}

export interface ServiceAlternatives {
  service: string;
  alternatives: Alternative[];
}

// Base de alternativas por serviço
const ALTERNATIVES_DATABASE: Record<string, Alternative[]> = {
  // Streaming de Vídeo
  'netflix': [
    { name: 'Pluto TV', type: 'free', description: 'Streaming gratuito com anúncios', url: 'https://pluto.tv' },
    { name: 'Tubi', type: 'free', description: 'Filmes e séries grátis', url: 'https://tubitv.com' },
    { name: 'Compartilhar conta', type: 'tip', description: 'Divida com familiares no mesmo endereço' },
  ],
  'disney': [
    { name: 'Assinar anual', type: 'cheaper', description: 'Economize até 16% pagando anual' },
    { name: 'Combo Disney+Star+', type: 'tip', description: 'Verifique se o combo compensa mais' },
  ],
  'hbo': [
    { name: 'Pluto TV', type: 'free', description: 'Conteúdo Warner gratuito', url: 'https://pluto.tv' },
    { name: 'Assinar via operadora', type: 'cheaper', description: 'Algumas operadoras incluem HBO grátis' },
  ],
  'prime': [
    { name: 'Frete grátis já compensa?', type: 'tip', description: 'Calcule se o frete grátis paga a assinatura' },
    { name: 'Prime Video avulso', type: 'cheaper', description: 'Só vídeo é mais barato que Prime completo' },
  ],
  'amazon': [
    { name: 'Frete grátis já compensa?', type: 'tip', description: 'Calcule quantas compras faz por mês' },
  ],
  
  // Streaming de Música
  'spotify': [
    { name: 'Spotify Free', type: 'free', description: 'Versão gratuita com anúncios' },
    { name: 'YouTube Music', type: 'free', description: 'Versão gratuita disponível' },
    { name: 'Plano Família/Duo', type: 'cheaper', description: 'Divida o custo com outros' },
  ],
  'youtube': [
    { name: 'uBlock Origin', type: 'free', description: 'Bloqueador de anúncios para navegador', url: 'https://ublockorigin.com' },
    { name: 'Brave Browser', type: 'free', description: 'Navegador que bloqueia ads nativamente', url: 'https://brave.com' },
    { name: 'NewPipe (Android)', type: 'free', description: 'App alternativo sem anúncios', url: 'https://newpipe.net' },
  ],
  'deezer': [
    { name: 'Spotify Free', type: 'free', description: 'Alternativa gratuita com anúncios' },
    { name: 'YouTube Music', type: 'free', description: 'Versão gratuita disponível' },
  ],
  'apple music': [
    { name: 'Spotify Free', type: 'free', description: 'Alternativa gratuita com anúncios' },
    { name: 'YouTube Music', type: 'free', description: 'Versão gratuita disponível' },
  ],
  
  // Software/Produtividade
  'adobe': [
    { name: 'Photopea', type: 'free', description: 'Editor online similar ao Photoshop', url: 'https://photopea.com' },
    { name: 'GIMP', type: 'free', description: 'Editor de imagens open source', url: 'https://gimp.org' },
    { name: 'Canva', type: 'free', description: 'Design simples e rápido', url: 'https://canva.com' },
    { name: 'DaVinci Resolve', type: 'free', description: 'Edição de vídeo profissional grátis', url: 'https://blackmagicdesign.com/davinciresolve' },
  ],
  'microsoft': [
    { name: 'Google Docs/Sheets', type: 'free', description: 'Suite office gratuita online', url: 'https://docs.google.com' },
    { name: 'LibreOffice', type: 'free', description: 'Suite office open source', url: 'https://libreoffice.org' },
  ],
  'office': [
    { name: 'Google Workspace', type: 'free', description: 'Docs, Sheets, Slides grátis', url: 'https://docs.google.com' },
    { name: 'LibreOffice', type: 'free', description: 'Suite completa open source', url: 'https://libreoffice.org' },
  ],
  'canva': [
    { name: 'Canva Free', type: 'free', description: 'Versão gratuita já é muito boa' },
    { name: 'Figma', type: 'free', description: 'Plano gratuito para uso pessoal', url: 'https://figma.com' },
  ],
  'figma': [
    { name: 'Figma Free', type: 'free', description: 'Plano gratuito para até 3 projetos' },
    { name: 'Penpot', type: 'free', description: 'Alternativa open source', url: 'https://penpot.app' },
  ],
  
  // IA
  'chatgpt': [
    { name: 'ChatGPT Free', type: 'free', description: 'GPT-3.5 é gratuito e bom para maioria dos casos' },
    { name: 'Claude', type: 'free', description: 'IA da Anthropic com plano free', url: 'https://claude.ai' },
    { name: 'Gemini', type: 'free', description: 'IA do Google gratuita', url: 'https://gemini.google.com' },
    { name: 'Perplexity', type: 'free', description: 'IA para pesquisas', url: 'https://perplexity.ai' },
  ],
  'openai': [
    { name: 'ChatGPT Free', type: 'free', description: 'Use a versão gratuita' },
    { name: 'Claude/Gemini', type: 'free', description: 'Alternativas gratuitas de qualidade' },
  ],
  
  // Cloud Storage
  'icloud': [
    { name: 'Google Drive 15GB', type: 'free', description: '15GB gratuitos', url: 'https://drive.google.com' },
    { name: 'Limpar fotos', type: 'tip', description: 'Delete duplicatas e vídeos antigos' },
  ],
  'google': [
    { name: 'Limpar Gmail', type: 'tip', description: 'Emails antigos ocupam espaço' },
    { name: 'Google Photos compacto', type: 'tip', description: 'Use qualidade "Economia" para não usar cota' },
  ],
  'dropbox': [
    { name: 'Google Drive', type: 'free', description: '15GB grátis vs 2GB do Dropbox', url: 'https://drive.google.com' },
    { name: 'OneDrive', type: 'free', description: '5GB grátis', url: 'https://onedrive.live.com' },
  ],
  
  // Academia/Saúde
  'smart fit': [
    { name: 'Treino em casa', type: 'free', description: 'YouTube tem milhares de treinos grátis' },
    { name: 'Parques públicos', type: 'free', description: 'Academias ao ar livre em parques' },
    { name: 'Plano básico', type: 'cheaper', description: 'Verifique se precisa do plano Black' },
  ],
  'gympass': [
    { name: 'Contrato direto com academia', type: 'cheaper', description: 'Às vezes sai mais barato' },
    { name: 'Smart Fit básico', type: 'cheaper', description: 'Se usa só uma academia' },
  ],
  
  // Delivery
  'ifood': [
    { name: 'Ligar diretamente', type: 'cheaper', description: 'Restaurantes têm preços menores fora do app' },
    { name: 'Cozinhar em casa', type: 'free', description: 'Economize até 70% preparando em casa' },
  ],
  'rappi': [
    { name: 'Comparar preços', type: 'tip', description: 'Compare com iFood e 99Food' },
    { name: 'Mercado direto', type: 'cheaper', description: 'Compras de mercado saem mais baratas presencialmente' },
  ],
  'uber': [
    { name: '99', type: 'cheaper', description: 'Compare preços entre apps' },
    { name: 'Transporte público', type: 'free', description: 'Muito mais barato para trajetos regulares' },
  ],
  
  // Games
  'xbox': [
    { name: 'Epic Games grátis', type: 'free', description: 'Jogos grátis toda semana', url: 'https://epicgames.com' },
    { name: 'Humble Bundle', type: 'cheaper', description: 'Pacotes com até 90% off', url: 'https://humblebundle.com' },
  ],
  'playstation': [
    { name: 'PS Plus Essential', type: 'cheaper', description: 'Plano mais barato se não usa catálogo' },
    { name: 'Jogos físicos usados', type: 'cheaper', description: 'OLX e Mercado Livre' },
  ],
  'steam': [
    { name: 'Epic Games grátis', type: 'free', description: 'Jogos grátis semanalmente', url: 'https://epicgames.com' },
    { name: 'Aguardar promoções', type: 'tip', description: 'Steam sale tem até 90% off' },
  ],
  
  // Dating
  'tinder': [
    { name: 'Bumble Free', type: 'free', description: 'Funcionalidades básicas grátis' },
    { name: 'Hinge', type: 'free', description: 'Foco em relacionamentos sérios' },
  ],
  
  // Educação
  'udemy': [
    { name: 'YouTube', type: 'free', description: 'Milhares de cursos gratuitos' },
    { name: 'FreeCodeCamp', type: 'free', description: 'Programação gratuita de qualidade', url: 'https://freecodecamp.org' },
    { name: 'Aguardar promoções', type: 'tip', description: 'Udemy sempre tem cursos a R$27,90' },
  ],
  'coursera': [
    { name: 'Auditar cursos', type: 'free', description: 'Conteúdo grátis sem certificado' },
    { name: 'edX', type: 'free', description: 'Cursos de Harvard/MIT grátis', url: 'https://edx.org' },
  ],
  'duolingo': [
    { name: 'Duolingo Free', type: 'free', description: 'Versão gratuita é suficiente para aprender' },
    { name: 'YouTube/Podcasts', type: 'free', description: 'Conteúdo nativo do idioma' },
  ],
};

/**
 * Busca alternativas para um serviço
 */
export function getAlternatives(serviceName: string): Alternative[] {
  const nameLower = serviceName.toLowerCase();
  
  // Busca direta
  if (ALTERNATIVES_DATABASE[nameLower]) {
    return ALTERNATIVES_DATABASE[nameLower];
  }
  
  // Busca parcial
  for (const [key, alternatives] of Object.entries(ALTERNATIVES_DATABASE)) {
    if (nameLower.includes(key) || key.includes(nameLower)) {
      return alternatives;
    }
  }
  
  // Alternativa genérica
  return [
    { name: 'Avaliar necessidade', type: 'tip', description: 'Você realmente usa este serviço?' },
    { name: 'Buscar alternativas grátis', type: 'tip', description: 'Pesquise por "[nome] free alternative"' },
    { name: 'Negociar desconto', type: 'tip', description: 'Entre em contato e peça desconto para renovar' },
  ];
}

/**
 * Retorna a cor do badge baseado no tipo de alternativa
 */
export function getAlternativeStyle(type: Alternative['type']): string {
  switch (type) {
    case 'free':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'cheaper':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'tip':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  }
}

/**
 * Retorna o label do tipo
 */
export function getAlternativeLabel(type: Alternative['type']): string {
  switch (type) {
    case 'free': return 'GRÁTIS';
    case 'cheaper': return 'ECONOMIA';
    case 'tip': return 'DICA';
  }
}
