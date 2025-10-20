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
      <div className="flex flex-col leading-tight font-sans select-none">
        <span
          className="text-2xl md:text-[1.8rem] font-extrabold tracking-[-0.015em]
               text-white
               font-[ClashDisplay,SpaceGrotesk,Poppins,ui-sans-serif]
               drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]"
        >
          Ethona Digital Lab
        </span>

        <span
          className="text-[0.85rem] md:text-[0.95rem] font-medium italic tracking-[0.05em]
               text-white/70
               font-[DM Sans,Inter,ui-sans-serif]"
        >
          Where strategy meets AI
        </span>
      </div>
    </div>
  );
};

export default Logo;
