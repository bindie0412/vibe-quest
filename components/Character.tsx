
import React from 'react';
import { PersonaExpression } from '../types';

interface CharacterProps {
  expression: PersonaExpression;
  avatar: string; // The skin icon (e.g., 🧙, 🛡️, 👤)
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Character: React.FC<CharacterProps> = ({ expression, avatar, size = 'md', className = '' }) => {
  const getExpressionEmoji = () => {
    switch (expression) {
      case 'HAPPY': return ' ^▽^ ';
      case 'FOCUSED': return ' •̀ - •́ ';
      case 'SAD': return ' T-T ';
      case 'ANGRY': return ' `д´ ';
      default: return ' •◡• ';
    }
  };

  const getExpressionColor = () => {
    switch (expression) {
      case 'HAPPY': return 'text-pink-500';
      case 'FOCUSED': return 'text-indigo-700';
      case 'SAD': return 'text-blue-500';
      case 'ANGRY': return 'text-red-600';
      default: return 'text-gray-700';
    }
  };

  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
    xl: 'text-8xl'
  };

  const faceSizeClasses = {
    sm: 'text-[8px]',
    md: 'text-[12px]',
    lg: 'text-[18px]',
    xl: 'text-[24px]'
  };

  return (
    <div className={`relative flex flex-col items-center justify-center transition-all duration-500 ${className}`}>
      {/* The Skin (Avatar) */}
      <div className={`
        ${sizeClasses[size]} 
        select-none
        animate-bounce
        filter drop-shadow-md
      `}
      style={{ animationDuration: expression === 'FOCUSED' ? '0.8s' : '2s' }}
      >
        {avatar}
        
        {/* Overlay Face Expression */}
        <div className={`
          absolute inset-0 flex items-center justify-center 
          ${getExpressionColor()} 
          ${faceSizeClasses[size]} 
          font-black tracking-tighter
          pointer-events-none
          mt-1
        `}>
          <div className="bg-white/80 px-1 rounded-full shadow-sm backdrop-blur-[1px]">
            {getExpressionEmoji()}
          </div>
        </div>
      </div>

      {/* Particle Effects */}
      {expression === 'HAPPY' && (
        <div className="absolute -top-6 flex gap-1">
          <span className="text-pink-400 text-xs animate-ping">❤️</span>
          <span className="text-yellow-400 text-xs animate-bounce delay-100">✨</span>
        </div>
      )}
      {expression === 'ANGRY' && (
        <div className="absolute -top-4 right-0">
          <span className="text-red-500 text-sm font-bold animate-pulse">💢</span>
        </div>
      )}
      {expression === 'SAD' && (
        <div className="absolute top-0 -left-2 animate-bounce">
          <span className="text-blue-300 text-xs">💧</span>
        </div>
      )}
    </div>
  );
};
