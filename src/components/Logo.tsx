import logoIcon from "@/assets/ethona-logo-icon.png";

const Logo = () => {
  return (
    <div className="flex items-center gap-3 select-none">
      {/* Masked icon: NO background, filled with brand gradient */}
      <div
        aria-hidden
        className="
          block
          h-[5.5rem] w-[10rem]     /* size here */
          bg-gradient-to-r from-[#f59e0b] via-[#ec4899] to-[#8b5cf6]
          drop-shadow-sm
        "
        style={{
          WebkitMaskImage: `url(${logoIcon})`,
          maskImage: `url(${logoIcon})`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskPosition: "left center",
          maskPosition: "left center",
        }}
      />
    </div>
  );
};

export default Logo;
