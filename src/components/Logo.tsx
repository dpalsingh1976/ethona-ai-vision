import logoIcon from "@/assets/ethona-logo-icon.png";

const Logo = () => {
  return (
    <div className="relative flex items-center gap-4 select-none">
      {/* Ambient glow (behind icon) */}
      <div
        className="absolute -z-10 left-0 h-24 w-24 md:h-28 md:w-28 blur-3xl opacity-35"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, rgba(34,211,238,.35) 0%, transparent 55%), radial-gradient(circle at 70% 65%, rgba(251,191,36,.30) 0%, transparent 65%)",
        }}
      />

      {/* ICON — guaranteed transparent, no tile */}
      <img
        src={logoIcon}
        alt="Ethona Digital Lab"
        className="h-14 w-14 md:h-20 md:w-20 object-contain block"
        style={{
          // absolutely no background on the element
          background: "transparent",
          WebkitMaskImage: "none",
          // soft depth + color glow (doesn’t create a box)
          filter: [
            "drop-shadow(0 4px 10px rgba(0,0,0,.45))",
            "drop-shadow(0 0 10px rgba(34,211,238,.35))",
            "drop-shadow(0 0 8px rgba(251,191,36,.28))",
          ].join(" "),
          // IMPORTANT: ensure browser does not composite white behind PNG
          mixBlendMode: "normal",
        }}
      />

      {/* Wordmark */}
      <div className="flex flex-col leading-tight font-sans ml-1">
        <h1 className="font-extrabold tracking-[-0.02em] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,.4)]
                       text-[1.55rem] sm:text-[1.8rem] md:text-[2.1rem] lg:text-[2.3rem]">
          <span className="mr-2">Ethona</span>
          <span className="hidden md:inline">Digital Lab</span>
          <span className="block md:hidden">Digital Lab</span>
        </h1>

        <div className="relative mt-0.5">
          <span className="text-[0.9rem] md:text-[1rem] italic font-medium tracking-wide text-amber-300
                           drop-shadow-[0_1px_1px_rgba(0,0,0,.35)]">
            Where strategy meets AI
          </span>
          <span className="block h-[3px] w-16 rounded-full mt-1
                           bg-gradient-to-r from-amber-300 via-amber-200 to-cyan-300 opacity-80" />
        </div>
      </div>
    </div>
  );
};

export default Logo;
