import React from 'react';

export const BrandLogo = ({ className = 'w-9 h-9', showText = true, textClassName = 'text-xl' }) => {
  return (
    <div className="flex items-center space-x-2.5 group cursor-pointer">
      <div className={`relative transition-transform duration-300 group-hover:scale-105 ${className}`}>
        <img src="/favicon.svg" alt="MeghaPrayan Logo" className="w-full h-full object-contain" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-black tracking-tight text-slate-900 group-hover:text-sky-600 transition-colors ${textClassName}`}>
            Megha<span className="text-sky-500">Prayan</span>
          </span>
          <span className="text-[10px] tracking-widest uppercase font-semibold text-slate-600">Smart Weather Travel</span>
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
