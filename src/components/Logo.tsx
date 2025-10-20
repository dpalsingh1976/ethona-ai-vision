import logoIcon from "@/assets/ethona-logo-icon.png";

const Logo = () => {
  return (
    <div className="flex items-center gap-3 select-none">
      <img
        src={logoIcon}
        alt="Ethona Digital Lab"
        className="block h-[5.5rem] w-[10rem] object-contain"
        style={{
          transform: "scaleX(1.2) scaleY(1.05)",
          backgroundColor: "transparent",
          mixBlendMode: "screen", // hides dark box on light bg
          filter: "brightness(1.1) contrast(1.1)",
        }}
      />
    </div>
  );
};

export default Logo;
