import React from "react";
import { Link } from "react-router-dom";
import { FPNavbar } from "@/components/flourist-place/layout/FPNavbar";
import { FPFooter } from "@/components/flourist-place/layout/FPFooter";
import { CartItemRow } from "@/components/flourist-place/cart/CartItemRow";
import { useFleuristCart } from "@/hooks/useFleuristCart";
import { ShoppingBasket, ArrowRight, Leaf, Package } from "lucide-react";

export default function FlouristPlaceCart() {
  const { items, subtotal, totalItems, isMixedCart, perishableItems, nonPerishableItems } = useFleuristCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-fp-cream/20 font-sans">
        <FPNavbar />
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <ShoppingBasket className="w-20 h-20 text-fp-blush mx-auto mb-6" />
          <h2 className="font-serif text-3xl font-bold text-fp-forest mb-3">Your Cart is Empty</h2>
          <p className="text-fp-forest/50 mb-8">Discover our beautiful collection of fresh flowers and décor.</p>
          <Link
            to="/flouristPlace/products"
            className="inline-flex items-center gap-2 bg-fp-rose text-white px-8 py-3 rounded-xl font-medium hover:bg-fp-rose/90 transition-colors"
          >
            Browse Flowers <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <FPFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fp-cream/20 font-sans">
      <FPNavbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-serif text-3xl font-bold text-fp-forest mb-8">
          Your Cart ({totalItems} item{totalItems !== 1 ? "s" : ""})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2">
            {/* Mixed cart notice */}
            {isMixedCart && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
                <p className="text-amber-800 text-sm font-medium mb-1">🚚 Mixed Cart — Two Shipments</p>
                <p className="text-amber-700 text-sm">
                  Your order contains fresh flowers and lasting items. These will ship in{" "}
                  <strong>separate packages</strong> with different shipping options.
                </p>
              </div>
            )}

            {/* Perishable group */}
            {perishableItems.length > 0 && (
              <div className="bg-white rounded-2xl border border-fp-blush/30 p-4 mb-4">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-fp-blush/20">
                  <Leaf className="w-4 h-4 text-fp-rose" />
                  <span className="font-medium text-fp-forest text-sm">Fresh Flowers</span>
                  <span className="ml-auto text-xs text-fp-forest/50">Ships separately</span>
                </div>
                {perishableItems.map((item) => (
                  <CartItemRow key={item.id} item={item} />
                ))}
              </div>
            )}

            {/* Non-perishable group */}
            {nonPerishableItems.length > 0 && (
              <div className="bg-white rounded-2xl border border-fp-blush/30 p-4 mb-4">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-fp-blush/20">
                  <Package className="w-4 h-4 text-fp-forest" />
                  <span className="font-medium text-fp-forest text-sm">Décor & Lasting Items</span>
                  {isMixedCart && <span className="ml-auto text-xs text-fp-forest/50">Ships separately</span>}
                </div>
                {nonPerishableItems.map((item) => (
                  <CartItemRow key={item.id} item={item} />
                ))}
              </div>
            )}

            {/* Continue shopping */}
            <Link
              to="/flouristPlace/products"
              className="text-fp-rose text-sm hover:underline flex items-center gap-1 mt-2"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-fp-blush/30 p-6 sticky top-20">
              <h3 className="font-semibold text-fp-forest text-lg mb-4">Order Summary</h3>

              <div className="space-y-2 text-sm text-fp-forest/60 pb-4 border-b border-fp-blush/20">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="truncate mr-2">{item.name} ×{item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-fp-forest font-semibold text-base mt-4 mb-6">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <p className="text-xs text-fp-forest/40 mb-4">
                Shipping calculated at checkout based on your location and delivery date.
              </p>

              <Link
                to="/flouristPlace/checkout"
                className="block w-full h-12 bg-fp-rose text-white rounded-xl font-medium text-center leading-[3rem] hover:bg-fp-rose/90 transition-colors"
              >
                Proceed to Checkout →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <FPFooter />
    </div>
  );
}
