import { useState } from "react";
import logo from "../assets/ethona-logo.png"; // ← path from /src/components

const nav = [
  { label: "Home", href: "#" },
  { label: "About Us", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Contact Us", href: "#contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/55 bg-white/75 border-b border-black/5">
      {/* width container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo + brand */}
          <a href="#" className="flex items-center gap-3" aria-label="Ethona Digital Lab">
            <img
              src={logo}
              alt="Ethona Digital Lab"
              className="h-9 w-auto sm:h-10 shrink-0 drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]"
              loading="eager"
              decoding="async"
            />
            <span className="hidden sm:block font-semibold tracking-tight text-neutral-900">
              Ethona Digital Lab
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {nav.map((n) => (
              <a
                key={n.label}
                href={n.href}
                className="text-sm font-medium text-neutral-800 hover:text-neutral-950 hover:underline underline-offset-4"
              >
                {n.label}
              </a>
            ))}
          </nav>

          {/* Mobile button */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-neutral-700 hover:bg-neutral-100"
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Mobile nav panel */}
        {open && (
          <div className="md:hidden pb-4">
            <nav className="flex flex-col gap-2">
              {nav.map((n) => (
                <a
                  key={n.label}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-base font-medium text-neutral-800 hover:bg-neutral-100"
                >
                  {n.label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
