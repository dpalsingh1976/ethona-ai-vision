import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FPNavbar } from "@/components/flourist-place/layout/FPNavbar";
import { FPFooter } from "@/components/flourist-place/layout/FPFooter";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Calendar, MapPin, Truck, Package, ArrowRight } from "lucide-react";

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      supabase
        .from("fp_orders")
        .select("*")
        .eq("id", id)
        .single()
        .then(({ data }) => {
          setOrder(data);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-fp-cream/20 flex items-center justify-center">
        <div className="text-fp-forest/40 animate-pulse">Loading your order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-fp-cream/20 font-sans">
        <FPNavbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-fp-forest/50">Order not found.</p>
        </div>
      </div>
    );
  }

  const shippingBreakdown = order.shipping_cost_breakdown || {};
  const shippingTotal = Object.values(shippingBreakdown).reduce(
    (sum: number, v: any) => sum + Number(v),
    0
  );

  return (
    <div className="min-h-screen bg-fp-cream/20 font-sans">
      <FPNavbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* Success header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-fp-forest mb-2">Order Confirmed! 🌸</h1>
          <p className="text-fp-forest/60">
            Thank you{order.guest_name ? `, ${order.guest_name}` : ""}! We're preparing your flowers with care.
          </p>
          <p className="text-xs text-fp-forest/40 mt-2">Order #{id?.slice(0, 8).toUpperCase()}</p>
        </div>

        {/* Event & Delivery Summary */}
        <div className="bg-white rounded-2xl border border-fp-blush/20 p-6 mb-4 space-y-4">
          <h2 className="font-semibold text-fp-forest text-base">Order Details</h2>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-fp-rose text-base">💍</span>
              <div>
                <p className="text-fp-forest/50 text-xs">Event</p>
                <p className="font-medium text-fp-forest capitalize">
                  {order.event_type}
                  {order.custom_event_name ? ` — ${order.custom_event_name}` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-fp-rose mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-fp-forest/50 text-xs">Event Date</p>
                <p className="font-medium text-fp-forest">{order.event_date}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-fp-rose mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-fp-forest/50 text-xs">Delivery Date</p>
                <p className="font-medium text-fp-forest">{order.delivery_date}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              {order.delivery_mode === "delivery" ? (
                <Truck className="w-4 h-4 text-fp-rose mt-0.5 flex-shrink-0" />
              ) : (
                <MapPin className="w-4 h-4 text-fp-rose mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className="text-fp-forest/50 text-xs">Method</p>
                <p className="font-medium text-fp-forest capitalize">{order.delivery_mode}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cost summary */}
        <div className="bg-fp-blush/20 rounded-2xl p-6 mb-6">
          <h2 className="font-semibold text-fp-forest text-base mb-3">Cost Summary</h2>
          <div className="space-y-2 text-sm text-fp-forest/60">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{Number(order.shipping_total) === 0 ? "Free" : `$${Number(order.shipping_total).toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-semibold text-fp-forest text-base pt-2 border-t border-fp-blush/30">
              <span>Total</span>
              <span>${Number(order.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* What's next */}
        <div className="bg-fp-forest text-white rounded-2xl p-6 mb-8">
          <h2 className="font-semibold text-base mb-3">What Happens Next?</h2>
          <ul className="space-y-2 text-sm text-white/80">
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-fp-rose flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
              Our team reviews and confirms your order
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-fp-rose flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
              Flowers are freshly prepared closer to your delivery date
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-fp-rose flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
              {order.delivery_mode === "pickup"
                ? "Ready for pickup at your chosen location"
                : "Delivered to your address on the selected date"}
            </li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Link
            to="/flouristPlace"
            className="flex-1 h-12 border border-fp-blush text-fp-forest rounded-xl font-medium flex items-center justify-center hover:bg-fp-blush/20 transition-colors"
          >
            Back to Home
          </Link>
          <Link
            to="/flouristPlace/products"
            className="flex-1 h-12 bg-fp-rose text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-fp-rose/90 transition-colors"
          >
            Shop More <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <FPFooter />
    </div>
  );
}
