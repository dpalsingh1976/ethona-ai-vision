import logoIcon from "@/assets/ethona-logo-icon.png";

/**
 * Brand mark that blends with the navbar:
 * - Uses PNG as a luminance mask (no visible background)
 * - Fills with brand gradient
 * - Shows gradient text next to the icon
 */
export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      {/* Icon cutout (no background) */}
      <div
        aria-hidden
        className="
          h-9 w-9 md:h-10 md:w-10
          bg-gradient-to-br from-[#f59e0b] via-[#ec4899] to-[#8b5cf6]
          drop-shadow-sm
        "
        style={{
          WebkitMaskImage: `url(${logoIcon})`,
          maskImage: `url(${logoIcon})`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      />
      {/* Brand text (gradient-filled, blends with navbar) */}
      <div className="leading-tight">
        <div className="font-semibold text-lg md:text-xl bg-gradient-to-r from-[#f59e0b] via-[#ec4899] to-[#8b5cf6] bg-clip-text text-transparent tracking-tight">
          Ethona Digital Lab
        </div>
        <div className="text-[11px] md:text-xs text-muted-foreground">
          Where strategy meets AI
        </div>
      </div>
    </div>
  );
}
