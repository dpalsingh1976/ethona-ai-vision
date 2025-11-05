import logoIcon from "@/assets/ethona-logo-icon.png";

const Footer = () => {
  return (
    <footer className="py-12 px-6 bg-primary text-primary-foreground">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo and description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              {/* Logo Wrapper */}
              <span
                className="
                  relative shrink-0 h-12 w-12 md:h-14 md:w-14
                  rounded-xl overflow-hidden
                  [mask-image:radial-gradient(closest-side,black_98%,transparent_100%)]
                  [mask-size:100%_100%] [mask-repeat:no-repeat]
                "
                style={{
                  WebkitMaskImage: "radial-gradient(closest-side, black 98%, transparent 100%)",
                  WebkitMaskRepeat: "no-repeat",
                  WebkitMaskSize: "100% 100%",
                }}
              >
                <img
                  src={logoIcon}
                  alt="Ethona Digital Lab"
                  className="h-full w-full object-cover"
                  style={{
                    mixBlendMode: "lighten",
                    filter: [
                      "brightness(1.05)",
                      "contrast(1.1)",
                      "saturate(1.1)",
                      "drop-shadow(0 6px 8px rgba(0,0,0,0.35))",
                      "drop-shadow(0 0 10px rgba(34,211,238,0.2))",
                      "drop-shadow(0 0 6px rgba(251,191,36,0.15))",
                    ].join(" "),
                  }}
                />
                {/* Inner vignette to hide halo */}
                <span
                  className="pointer-events-none absolute inset-0 rounded-xl"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.25)" }}
                />
              </span>

              {/* Brand name */}
              <div>
                <div className="font-bold text-lg">Ethona Digital Lab</div>
                <div className="text-xs opacity-80 italic">Where Strategy Meets AI</div>
              </div>
            </div>

            <p className="text-sm opacity-80 max-w-md">
              Transforming businesses through innovative digital marketing strategies and cutting-edge AI automation
              solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <a href="/#services" className="hover:opacity-100 transition-opacity">
                  Services
                </a>
              </li>
              <li>
                <a href="/about" className="hover:opacity-100 transition-opacity">
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:opacity-100 transition-opacity">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>info@ethonadigitallab.com</li>
              <li>+1 (646) 284-4268</li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-primary-foreground/20 pt-8 text-center text-sm opacity-80">
          <p>&copy; 2025 Ethona Digital Lab. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
