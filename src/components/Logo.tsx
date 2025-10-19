import logoIcon from "@/assets/ethona-logo-icon.png";

const Logo = () => {
  return (
    <div className="flex items-center gap-3 select-none">
      {/* Logo Icon */}
      <img
        src={logoIcon}
        alt="Ethona Digital Lab"
        className="h-16 w-auto object-contain drop-shadow-md"
        style={{ backgroundColor: "transparent" }}
      />

      {/* Logo Text */}
      <div className="flex flex-col leading-tight">
        <span className="text-[20px] font-extrabold bg-gradient-to-r from-[#f59e0b] via-[#ec4899] to-[#8b5cf6] bg-clip-text text-transparent tracking-tight">
          Ethona Digital Lab
        </span>
        <span className="text-[12px] text-muted-foreground font-medium">Where strategy meets AI</span>
      </div>
    </div>
  );
};

export default Logo;
