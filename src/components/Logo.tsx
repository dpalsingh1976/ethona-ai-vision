import logoIcon from "@/assets/ethona-logo-icon.png";

const Logo = () => {
  return (
    <div className="relative flex items-center gap-4 select-none">
      {/* Background lighting effect (mimics your banner gradient lines) */}
      <div
        className="absolute -z-10 left-0 h-24 w-24 md:h-28 md:w-28 blur-3xl opacity-40"
        style={{
          background:
            "radial-gradient(circle at 40% 40%, rgba(34,211,238,0.35) 0%, transparent 60%), radial-gradient(circle at 70% 60%, rgba(251,191,36,0.3) 0%, transparent 65%)",
        }}
      />

      {/* Transparent logo with smooth glow */}
      <img
        src={`${logoIcon}?v=5`}
        alt="Ethona Digital Lab"
        className="h-14 w-14 md:h-20 md:w-20 object-contain"
        style={{
          backgroundColor: "transparent", // ensure no background box
          mixBlendMode: "screen", // helps blend on dark bg
          filter: [
            "drop-shadow(0 4px 8px rgba(0,0,0,0.45))",
            "drop-shadow(0 0 8px rgba(34,211,238,0.4))",
            "drop-shadow(0 0 6px rgba(251,191,36,0.35))",
          ].join(" "),
        }}
      />

      {/* Wordmark */}
      <div className="flex flex-col leading-tight font-sans ml-1">
        <h1
          className="font-extrabold tracking-[-0.02em] text-white 
                     drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]
                     text-[1.55rem] sm:text-[1.8rem] md:text-[2.1rem] lg:text-[2.3rem]"
        >
          <span className="mr-2">Ethona</span>
          <span className="hidden md:inline">Digital Lab</span>
          <span className="block md:hidden">Digital Lab</span>
        </h1>

        {/* Tagline */}
        <div className="relative mt-0.5">
          <span
            className="text-[0.9rem] md:text-[1rem] italic font-medium tracking-wide 
                       text-amber-300 drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]"
          >
            Where strategy meets AI
          </span>
          <span
            className="block h-[3px] w-16 rounded-full mt-1 
                       bg-gradient-to-r from-amber-300 via-amber-200 to-cyan-300 opacity-80"
          />
        </div>
      </div>

      {/* Subtle gradient streaks */}
      <div className="pointer-events-none absolute -right-6 -bottom-4 -z-10 hidden md:block opacity-60">
        <div className="h-1 w-24 rounded-full mb-2 bg-cyan-300/70"></div>
        <div className="h-1 w-16 rounded-full mb-2 bg-amber-300/80"></div>
        <div className="h-1 w-20 rounded-full bg-rose-400/70"></div>
      </div>
    </div>
  );
};

export default Logo;
