import React, { useState, useEffect } from 'react';
import { fetchServiceIcon } from '../services/svglService';
import { 
  Zap, Clapperboard, Music, Car, Utensils, ShoppingCart, 
  PenTool, Bot, HardDrive, Smartphone, AppWindow, Gamepad2,
  Dumbbell, Cloud, CreditCard
} from 'lucide-react';

interface ServiceIconProps {
  serviceName: string;
  category: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Fallback icons por categoria ou serviço
const getFallbackIcon = (name: string, category: string, size: string) => {
  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-5 h-5';
  const n = name.toLowerCase();
  const c = category.toLowerCase();

  if (n.includes('netflix') || n.includes('hbo') || n.includes('disney') || n.includes('prime video')) {
    return <Clapperboard className={iconSize} />;
  }
  if (n.includes('spotify') || n.includes('deezer') || n.includes('apple music') || n.includes('youtube music')) {
    return <Music className={iconSize} />;
  }
  if (n.includes('uber') || n.includes('99') || n.includes('cabify')) {
    return <Car className={iconSize} />;
  }
  if (n.includes('ifood') || n.includes('rappi')) {
    return <Utensils className={iconSize} />;
  }
  if (n.includes('amazon') || n.includes('mercadolivre') || n.includes('shopee')) {
    return <ShoppingCart className={iconSize} />;
  }
  if (n.includes('adobe') || n.includes('figma') || n.includes('canva')) {
    return <PenTool className={iconSize} />;
  }
  if (n.includes('chatgpt') || n.includes('openai') || n.includes('claude')) {
    return <Bot className={iconSize} />;
  }
  if (n.includes('google') || n.includes('drive') || n.includes('icloud') || n.includes('dropbox')) {
    return <HardDrive className={iconSize} />;
  }
  if (n.includes('tinder') || n.includes('bumble')) {
    return <Smartphone className={iconSize} />;
  }
  if (n.includes('microsoft') || n.includes('office')) {
    return <AppWindow className={iconSize} />;
  }
  
  // Por categoria
  if (c.includes('streaming')) return <Clapperboard className={iconSize} />;
  if (c.includes('software') || c.includes('app')) return <Cloud className={iconSize} />;
  if (c.includes('game')) return <Gamepad2 className={iconSize} />;
  if (c.includes('saúde') || c.includes('health') || c.includes('fit')) return <Dumbbell className={iconSize} />;
  
  return <Zap className={iconSize} />;
};

const ServiceIcon: React.FC<ServiceIconProps> = ({ 
  serviceName, 
  category, 
  size = 'md',
  className = '' 
}) => {
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const iconSizeClass = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const imgSizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';

  useEffect(() => {
    let mounted = true;
    
    const loadIcon = async () => {
      setLoading(true);
      setError(false);
      
      try {
        const url = await fetchServiceIcon(serviceName);
        if (mounted) {
          setIconUrl(url);
          setLoading(false);
        }
      } catch (e) {
        if (mounted) {
          setError(true);
          setLoading(false);
        }
      }
    };
    
    loadIcon();
    
    return () => {
      mounted = false;
    };
  }, [serviceName]);

  // Estilo do container baseado no serviço
  const getContainerStyle = () => {
    const n = serviceName.toLowerCase();
    
    if (n.includes('netflix')) return 'bg-red-500/10 text-red-400 border-red-500/20';
    if (n.includes('spotify')) return 'bg-green-500/10 text-green-400 border-green-500/20';
    if (n.includes('disney')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (n.includes('amazon') || n.includes('prime')) return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    if (n.includes('hbo')) return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    if (n.includes('adobe')) return 'bg-red-600/10 text-red-500 border-red-600/20';
    if (n.includes('microsoft') || n.includes('office')) return 'bg-blue-600/10 text-blue-500 border-blue-600/20';
    if (n.includes('google') || n.includes('youtube')) return 'bg-red-500/10 text-red-400 border-red-500/20';
    if (n.includes('apple') || n.includes('icloud')) return 'bg-gray-400/10 text-gray-300 border-gray-400/20';
    if (n.includes('chatgpt') || n.includes('openai')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (n.includes('smart fit') || n.includes('gympass')) return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    if (n.includes('steam') || n.includes('xbox') || n.includes('playstation')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (n.includes('figma')) return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    if (n.includes('notion')) return 'bg-gray-400/10 text-gray-300 border-gray-400/20';
    if (n.includes('slack')) return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    if (n.includes('discord')) return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    
    return 'bg-surfaceHighlight text-gray-400 border-white/10';
  };

  return (
    <div className={`${iconSizeClass} rounded-lg flex items-center justify-center border ${getContainerStyle()} ${className}`}>
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-50" />
      ) : iconUrl && !error ? (
        <img 
          src={iconUrl} 
          alt={serviceName}
          className={`${imgSizeClass} object-contain`}
          onError={() => setError(true)}
        />
      ) : (
        getFallbackIcon(serviceName, category, size)
      )}
    </div>
  );
};

export default ServiceIcon;
