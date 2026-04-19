import React from 'react';

const Logo = ({ iconSize = "w-10 h-10", showText = false }) => {
  return (
    <div className="flex items-center gap-3">
      {/* Icon Wrapper with fixed size */}
      <div className={`${iconSize} shrink-0`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          
          {/* Book Base */}
          <path 
            d="M50 85L20 75V25L50 35L80 25V75L50 85Z" 
            fill="url(#logo-grad)" 
            fillOpacity="0.1"
            stroke="url(#logo-grad)" 
            strokeWidth="5" 
            strokeLinejoin="round"
          />
          
          {/* Book Spine */}
          <path d="M50 35V85" stroke="url(#logo-grad)" strokeWidth="4" strokeLinecap="round"/>
          
          {/* Clock Element */}
          <circle cx="50" cy="22" r="10" stroke="url(#logo-grad)" strokeWidth="3" />
          <path d="M50 17V22L54 24" stroke="url(#logo-grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          
          {/* Growth Arrow (Thicker and clearer) */}
          <path 
            d="M32 68L46 54L54 62L76 38" 
            stroke="url(#logo-grad)" 
            strokeWidth="8" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M66 38H76V48" 
            stroke="url(#logo-grad)" 
            strokeWidth="8" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">Study</span>
          <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-500 uppercase tracking-[0.2em] mt-1 shrink-0">Tracker</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
