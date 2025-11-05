import logoIcon from "@/assets/ethona-logo-icon.png";

const Logo = () => {
  return (
    <div className="relative flex items-center gap-4 select-none">
      {/* Background matching layer */}
      <div className="absolute -z-20 left-0 h-14 w-14 md:h-20 md:w-20 rounded-lg"
           style={{ backgroundColor: '#1a2332' }} />
      
      {/* Glow halo behind the icon */}
      <div className="absolute -z-10 left-2 h-16 w-16 md:h-20 md:w-20 rounded-full blur-2xl opacity-60
                      bg-[radial-gradient(circle_at_60%_40%,#22d3ee_0%,transparent_55%),_radial-gradient(circle_at_40%_60%,#fbbf24_0%,transparent_60%)]" />

      {/* Logo Icon – no white tile, richer glow */}
      <img
        src={`${logoIcon}?v=4`}
        alt="Ethona Digital Lab"
        className="h-14 w-14 md:h-20 md:w-20 object-contain"
        style={{
          mixBlendMode: 'screen',
          filter: [
            "drop-shadow(0 6px 12px rgba(0,0,0,0.35))",
            "drop-shadow(0 0 16px rgba(34,211,238,0.35))",   // teal glow
            "drop-shadow(0 0 10px rgba(251,191,36,0.25))"    // yellow glow
          ].join(" ")
        }}
      />

      {/* Wordmark */}
      <div className="flex flex-col leading-tight font-sans ml-1">
        {/* Split into two lines on narrow, single line on md+ */}
        <h1 className="font-extrabold tracking-[-0.02em] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]
                       text-[1.55rem] sm:text-[1.8rem] md:text-[2.1rem] lg:text-[2.35rem]">
          <span className="mr-2">Ethona</span>
          <span className="hidden md:inline">Digital Lab</span>
          <span className="block md:hidden">Digital Lab</span>
        </h1>

        {/* Tagline in yellow with a soft highlight */}
        <div className="relative mt-0.5">
          <span className="text-[0.9rem] md:text-[1rem] italic font-medium tracking-wide text-amber-300
                           drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
            Where strategy meets AI
          </span>
          {/* small accent underline */}
          <span className="block h-[3px] w-16 rounded-full mt-1
                           bg-gradient-to-r from-amber-300 via-amber-200 to-cyan-300 opacity-80" />
        </div>
      </div>

      {/* Decorative corner streaks (subtle, like the banner) */}
      <div className="pointer-events-none absolute -right-6 -bottom-4 -z-10 hidden md:block opacity-70">
        <div className="h-1 w-24 rounded-full mb-2 bg-cyan-300/70"></div>
        <div className="h-1 w-16 rounded-full mb-2 bg-amber-300/80"></div>
        <div className="h-1 w-20 rounded-full bg-rose-400/70"></div>
      </div>
    </div>
  );
};

export default Logo;
