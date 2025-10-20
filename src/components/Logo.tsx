import logoIcon from "@/assets/ethona-logo-icon.png";

const Logo = () => {
  return (
    <div className="flex items-center gap-3 select-none">
      {/* Logo Icon */}
      <img
        src={logoIcon}
        alt="Ethona Digital Lab"
        className="h-[5.5rem] w-[9rem] object-contain"
        style={{
          transform: "scaleX(1.2) scaleY(1.05)",
          mixBlendMode: "multiply",
          filter: "brightness(1.1) contrast(1.15) drop-shadow(0 0px 0px rgba(0,0,0,0.1))",
        }}
      />

      {/* Logo Text */}
      <div className="flex flex-col leading-tight">
        <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#f59e0b] via-[#ec4899] to-[#8b5cf6] bg-clip-text text-transparent">
          Ethona Digital Lab
        </span>
        <span className="text-[0.75rem] md:text-sm text-muted-foreground tracking-wide">Where strategy meets AI</span>
      </div>
    </div>
  );
};

export default Logo;
