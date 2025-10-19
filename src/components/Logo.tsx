import logoIcon from "@/assets/ethona-logo-icon.png";

const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Creative AI Brain Icon with glow effect */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f59e0b] via-[#ec4899] to-[#8b5cf6] rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
        <div className="relative w-14 h-14 bg-white rounded-2xl p-2 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          <img 
            src={logoIcon} 
            alt="Ethona Digital Lab AI Icon" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>
      
      {/* Text content with creative styling */}
      <div className="flex flex-col leading-none">
        {/* Main brand name with letter spacing */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-[#1f2937] to-[#374151] bg-clip-text text-transparent">
            Ethona
          </span>
          <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-[#ec4899] via-[#db2777] to-[#8b5cf6] bg-clip-text text-transparent">
            Digital Lab
          </span>
        </div>
        
        {/* Tagline with AI emphasis and decorative line */}
        <div className="flex items-center gap-2 mt-1">
          <div className="h-px w-6 bg-gradient-to-r from-[#f59e0b] to-[#ec4899]" />
          <span className="text-[10px] font-semibold text-[#6B7280] tracking-widest uppercase">
            Where Strategy Meets
          </span>
          <span className="text-[11px] font-black bg-gradient-to-r from-[#f59e0b] via-[#ec4899] to-[#8b5cf6] bg-clip-text text-transparent tracking-wider uppercase">
            AI
          </span>
        </div>
      </div>
    </div>
  );
};

export default Logo;

