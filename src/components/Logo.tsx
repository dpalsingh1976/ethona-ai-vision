const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Animated gradient icon */}
      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f59e0b] via-[#ec4899] to-[#8b5cf6] flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
          <span className="text-2xl font-black text-white">E</span>
        </div>
        {/* Sparkle effect */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#f59e0b] rounded-full animate-pulse" />
      </div>
      
      {/* Text content */}
      <div className="flex flex-col leading-none">
        {/* Main brand name */}
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black bg-gradient-to-r from-[#374151] to-[#1f2937] bg-clip-text text-transparent">
            ETHONA
          </span>
          <span className="text-2xl font-black bg-gradient-to-r from-[#ec4899] via-[#db2777] to-[#8b5cf6] bg-clip-text text-transparent">
            DIGITAL
          </span>
        </div>
        
        {/* Subtitle with AI emphasis */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs font-semibold text-[#6B7280] tracking-wide">
            WHERE STRATEGY MEETS
          </span>
          <span className="text-xs font-black bg-gradient-to-r from-[#f59e0b] to-[#ec4899] bg-clip-text text-transparent tracking-wide">
            AI
          </span>
        </div>
      </div>
    </div>
  );
};

export default Logo;

