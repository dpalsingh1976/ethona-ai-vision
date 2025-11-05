import logoIcon from "@/assets/ethona-logo-icon.png";

const Logo = () => {
  return (
    <div className="relative flex items-center gap-4 select-none">
      {/* Soft balanced glow */}
      <div
        className="absolute -z-10 left-2 h-16 w-16 md:h-20 md:w-20 rounded-full blur-2xl opacity-50"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, rgba(34,211,238,0.4) 0%, transparent 60%), radial-gradient(circle at 40% 60%, rgba(251,191,36,0.35) 0%, transparent 65%)",
        }}
      />

      {/* Logo Icon – fully blended with transparent edges */}
      <img
        src={`${logoIcon}?v=7`}
        alt="Ethona Digital Lab"
        className="h-14 w-14 md:h-20 md:w-20 object-contain will-change-transform"
        style={{
          // Use a sharper circular fade so outer alpha disappears completely
          WebkitMaskImage: "radial-gradient(70% 70% at 50% 50%, #000 60%, rgba(0,0,0,0) 80%)",
          maskImage: "radial-gradient(70% 70% at 50% 50%, #000 60%, rgba(0,0,0,0) 80%)",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "contain",
          maskSize: "contain",

          // Blend into header without bright rim
          mixBlendMode: "lighten",
          opacity: 0.98,

          // Remove any color fringing
          backgroundColor: "transparent",
          filter: [
            "brightness(1.05)",
            "contrast(1.1)",
            "saturate(1.1)",
            "drop-shadow(0 6px 10px rgba(0,0,0,0.4))",
            "drop-shadow(0 0 12px rgba(34,211,238,0.25))",
            "drop-shadow(0 0 8px rgba(251,191,36,0.2))",
          ].join(" "),
        }}
      />

      {/* Wordmark */}
      <div className="flex flex-col leading-tight font-sans ml-1">
        <h1
          className="font-extrabold tracking-[-0.02em] text-white
                     drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]
                     text-[1.55rem] sm:text-[1.8rem] md:text-[2.1rem] lg:text-[2.35rem]"
        >
          <span className="mr-2">Ethona</span>
          <span className="hidden md:inline">Digital Lab</span>
          <span className="block md:hidden">Digital Lab</span>
        </h1>

        <div className="relative mt-0.5">
          <span
            className="text-[0.9rem] md:text-[1rem] italic font-medium tracking-wide text-amber-300
                       drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]"
          >
            Where strategy meets AI
          </span>
          <span
            className="block h-[3px] w-16 rounded-full mt-1
                       bg-gradient-to-r from-amber-300 via-amber-200 to-cyan-300 opacity-80"
          />
        </div>
      </div>

      {/* Decorative streaks */}
      <div className="pointer-events-none absolute -right-6 -bottom-4 -z-10 hidden md:block opacity-60">
        <div className="h-1 w-24 rounded-full mb-2 bg-cyan-300/70"></div>
        <div className="h-1 w-16 rounded-full mb-2 bg-amber-300/80"></div>
        <div className="h-1 w-20 rounded-full bg-rose-400/70"></div>
      </div>
    </div>
  );
};

export default Logo;
