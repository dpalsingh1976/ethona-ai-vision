import logoIcon from "@/assets/ethona-logo-icon.png";

const Logo = () => {
  return (
    <div className="flex items-center gap-3 select-none">
      {/* Logo Icon */}
      <img
        src={logoIcon}
        alt="Ethona Digital Lab"
        className="h-17 w-auto object-contain"
        style={{
          mixBlendMode: "multiply",
          filter: "brightness(1.1) contrast(1.15) drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
        }}
      />

      {/* Logo Text */}
    </div>
  );
};

export default Logo;
