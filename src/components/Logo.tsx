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
    </div>
  );
};

export default Logo;
