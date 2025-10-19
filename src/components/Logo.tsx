import logoIcon from "@/assets/ethona-logo-icon.png";

const Logo = () => {
  return (
    <div className="flex items-center gap-3 select-none">
      {/* Logo Icon */}
      <img
        src={logoIcon}
        alt="Ethona Digital Lab"
        className="h-[6.5rem] w-[15rem] object-contain"
        style={{
          transform: "scaleX(1.2) scaleY(1.05)",
          mixBlendMode: "multiply",
          filter: "brightness(1.1) contrast(1.15) drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
        }}
      />

      {/* Logo Text */}
    </div>
  );
};

export default Logo;
