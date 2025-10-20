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
          backgroundColor: "white",
          padding: "0.5rem",
          borderRadius: "0.5rem",
          filter: "brightness(1.05) contrast(1.1) drop-shadow(0 2px 4px rgba(0,0,0,0.15))",
        }}
      />

      {/* Logo Text */}
      <div className="flex flex-col leading-tight font-sans select-none ml-2">
        <span
          className="text-2xl md:text-[1.8rem] font-extrabold tracking-tight
               text-primary-foreground
               font-montserrat
               drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
        >
          Ethona Digital Lab
        </span>

        <span
          className="text-[0.85rem] md:text-[0.95rem] font-medium italic tracking-wide
               text-primary-foreground/70
               font-['DM_Sans',sans-serif]"
        >
          Where strategy meets AI
        </span>
      </div>
    </div>
  );
};

export default Logo;
