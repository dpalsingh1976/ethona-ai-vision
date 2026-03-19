import React from "react";
import { Link } from "react-router-dom";
import { FPNavbar } from "@/components/flourist-place/layout/FPNavbar";
import { FPFooter } from "@/components/flourist-place/layout/FPFooter";
import { CartItemRow } from "@/components/flourist-place/cart/CartItemRow";
import { useFleuristCart } from "@/hooks/useFleuristCart";
import { ShoppingBasket, ArrowRight, Leaf, Package, ShieldCheck } from "lucide-react";

export default function FlouristPlaceCart() {
  const { items, subtotal, totalItems, isMixedCart, perishableItems, nonPerishableItems } = useFleuristCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen font-sans" style={{ background: "hsl(var(--fp-cream)/0.2)" }}>
        <FPNavbar />
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "hsl(var(--fp-blush)/0.4)" }}
          >
            <ShoppingBasket className="w-12 h-12" style={{ color: "hsl(var(--fp-rose)/0.7)" }} />
          </div>
          <h2 className="font-serif text-3xl font-bold mb-3" style={{ color: "hsl(var(--fp-forest))" }}>
            Your Cart is Empty
          </h2>
          <p className="mb-8" style={{ color: "hsl(var(--fp-forest)/0.5)" }}>
            Discover our beautiful collection of Indian & Asian flowers.
          </p>
          <Link
            to="/flouristPlace/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{ background: "hsl(var(--fp-rose))" }}
          >
            Browse Flowers <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <FPFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans" style={{ background: "hsl(var(--fp-cream)/0.2)" }}>
      <FPNavbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 lg:pb-8">
        <h1 className="font-serif text-3xl font-bold mb-8" style={{ color: "hsl(var(--fp-forest))" }}>
          Your Cart{" "}
          <span
            className="text-xl font-normal"
            style={{ color: "hsl(var(--fp-forest)/0.45)" }}
          >
            ({totalItems} item{totalItems !== 1 ? "s" : ""})
          </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Mixed cart notice */}
            {isMixedCart && (
              <div
                className="rounded-2xl p-4 border flex items-start gap-3"
                style={{
                  background: "hsl(38 95% 95%)",
                  borderColor: "hsl(38 80% 80%)",
                }}
              >
                <span className="text-2xl">🚚</span>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "hsl(38 55% 28%)" }}>
                    Mixed Cart — Two Shipments
                  </p>
                  <p className="text-sm mt-0.5" style={{ color: "hsl(38 45% 35%)" }}>
                    Your order has fresh flowers and lasting items. These ship in <strong>separate packages</strong> with individual shipping options.
                  </p>
                </div>
              </div>
            )}

            {/* Fresh flowers group */}
            {perishableItems.length > 0 && (
              <div
                className="rounded-3xl border overflow-hidden"
                style={{ background: "white", borderColor: "hsl(var(--fp-blush)/0.35)" }}
              >
                <div
                  className="flex items-center gap-2 px-5 py-3.5 border-b"
                  style={{
                    background: "hsl(var(--fp-blush)/0.2)",
                    borderColor: "hsl(var(--fp-blush)/0.3)",
                  }}
                >
                  <Leaf className="w-4 h-4" style={{ color: "hsl(var(--fp-rose))" }} />
                  <span className="font-bold text-sm" style={{ color: "hsl(var(--fp-forest))" }}>
                    🌸 Fresh Flowers
                  </span>
                  {isMixedCart && (
                    <span className="ml-auto text-xs font-medium" style={{ color: "hsl(var(--fp-forest)/0.45)" }}>
                      Ships separately
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-1">
                  {perishableItems.map((item) => (
                    <CartItemRow key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Non-perishable group */}
            {nonPerishableItems.length > 0 && (
              <div
                className="rounded-3xl border overflow-hidden"
                style={{ background: "white", borderColor: "hsl(var(--fp-blush)/0.35)" }}
              >
                <div
                  className="flex items-center gap-2 px-5 py-3.5 border-b"
                  style={{
                    background: "hsl(var(--fp-cream)/0.6)",
                    borderColor: "hsl(var(--fp-blush)/0.3)",
                  }}
                >
                  <Package className="w-4 h-4" style={{ color: "hsl(var(--fp-forest))" }} />
                  <span className="font-bold text-sm" style={{ color: "hsl(var(--fp-forest))" }}>
                    📦 Décor & Lasting Items
                  </span>
                  {isMixedCart && (
                    <span className="ml-auto text-xs font-medium" style={{ color: "hsl(var(--fp-forest)/0.45)" }}>
                      Ships separately
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-1">
                  {nonPerishableItems.map((item) => (
                    <CartItemRow key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            <Link
              to="/flouristPlace/products"
              className="text-sm font-medium flex items-center gap-1 hover:underline"
              style={{ color: "hsl(var(--fp-rose))" }}
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* Order summary — desktop */}
          <div className="lg:col-span-1 hidden lg:block">
            <div
              className="rounded-3xl border p-6 sticky top-20"
              style={{ background: "white", borderColor: "hsl(var(--fp-blush)/0.35)" }}
            >
              <h3 className="font-bold text-lg mb-5" style={{ color: "hsl(var(--fp-forest))" }}>
                Order Summary
              </h3>

              <div className="space-y-2 text-sm pb-4 border-b" style={{ borderColor: "hsl(var(--fp-blush)/0.25)", color: "hsl(var(--fp-forest)/0.6)" }}>
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-2">
                    <span className="truncate">{item.name} ×{item.quantity}</span>
                    <span className="flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-bold text-base mt-4 mb-1" style={{ color: "hsl(var(--fp-forest))" }}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <p className="text-xs mb-5" style={{ color: "hsl(var(--fp-forest)/0.4)" }}>
                Shipping calculated at checkout
              </p>

              <Link
                to="/flouristPlace/checkout"
                className="block w-full h-12 rounded-2xl font-bold text-sm text-white text-center leading-[3rem] transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ background: "hsl(var(--fp-rose))" }}
              >
                Proceed to Checkout →
              </Link>

              <div className="flex items-center gap-2 mt-4 justify-center text-xs" style={{ color: "hsl(var(--fp-forest)/0.45)" }}>
                <ShieldCheck className="w-3.5 h-3.5" />
                Secure checkout
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky checkout bar */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 border-t px-4 py-3 flex items-center gap-4"
        style={{
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(12px)",
          borderColor: "hsl(var(--fp-blush)/0.4)",
          boxShadow: "0 -4px 20px hsl(var(--fp-rose)/0.1)",
        }}
      >
        <div>
          <p className="text-xs font-medium" style={{ color: "hsl(var(--fp-forest)/0.5)" }}>
            Subtotal
          </p>
          <p className="text-lg font-bold" style={{ color: "hsl(var(--fp-forest))" }}>
            ${subtotal.toFixed(2)}
          </p>
        </div>
        <Link
          to="/flouristPlace/checkout"
          className="flex-1 h-12 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all"
          style={{ background: "hsl(var(--fp-rose))" }}
        >
          Checkout →
        </Link>
      </div>

      <FPFooter />
    </div>
  );
}
