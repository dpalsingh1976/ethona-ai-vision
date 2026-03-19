import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FPNavbar } from "@/components/flourist-place/layout/FPNavbar";
import { FPFooter } from "@/components/flourist-place/layout/FPFooter";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Calendar, MapPin, Truck, ArrowRight, Package } from "lucide-react";

function ConfettiPiece({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="absolute rounded-sm pointer-events-none"
      style={{ width: 8, height: 12, ...style }}
    />
  );
}

function Confetti() {
  const pieces = Array.from({ length: 32 }).map((_, i) => ({
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 1.5}s`,
    animationDuration: `${2.5 + Math.random() * 2}s`,
    background: ["hsl(347,75%,60%)", "hsl(40,85%,58%)", "hsl(150,30%,45%)", "hsl(200,80%,60%)", "hsl(280,60%,65%)"][i % 5],
    transform: `rotate(${Math.random() * 360}deg)`,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <style>{`
        @keyframes confetti-fall {
          0% { top: -20px; opacity: 1; transform: translateX(0) rotate(0deg); }
          100% { top: 100%; opacity: 0; transform: translateX(${Math.random() > 0.5 ? "" : "-"}60px) rotate(720deg); }
        }
        .confetti-piece { animation: confetti-fall linear forwards; }
      `}</style>
      {pieces.map((p, i) => (
        <ConfettiPiece
          key={i}
          style={{
            left: p.left,
            top: -20,
            background: p.background,
            animationDelay: p.animationDelay,
            animationDuration: p.animationDuration,
            animation: `confetti-fall ${p.animationDuration} ${p.animationDelay} linear forwards`,
            transform: p.transform,
          }}
        />
      ))}
    </div>
  );
}

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);

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
    const t = setTimeout(() => setShowConfetti(false), 4500);
    return () => clearTimeout(t);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(var(--fp-cream)/0.3)" }}>
        <div className="animate-pulse text-base" style={{ color: "hsl(var(--fp-forest)/0.4)" }}>Loading your order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen font-sans" style={{ background: "hsl(var(--fp-cream)/0.3)" }}>
        <FPNavbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p style={{ color: "hsl(var(--fp-forest)/0.5)" }}>Order not found.</p>
        </div>
      </div>
    );
  }

  const shippingBreakdown = order.shipping_cost_breakdown || {};
  const addr = order.shipping_address as Record<string, string> | null;

  const timeline = [
    {
      step: 1,
      icon: "📋",
      title: "Order Confirmed",
      desc: "Your order has been received and is being reviewed.",
      done: true,
    },
    {
      step: 2,
      icon: "🌸",
      title: "Freshly Prepared",
      desc: `Flowers will be prepared closer to ${order.delivery_date}.`,
      done: false,
    },
    {
      step: 3,
      icon: order.delivery_mode === "pickup" ? "📍" : "🚚",
      title: order.delivery_mode === "pickup" ? "Ready for Pickup" : "Out for Delivery",
      desc:
        order.delivery_mode === "pickup"
          ? "Ready at your chosen pickup location on the selected date."
          : "Delivered fresh to your address on the selected date.",
      done: false,
    },
    {
      step: 4,
      icon: "🎉",
      title: "Event Day",
      desc: `Your event on ${order.event_date} — enjoy every petal!`,
      done: false,
    },
  ];

  return (
    <div className="min-h-screen font-sans" style={{ background: "hsl(var(--fp-cream)/0.2)" }}>
      <FPNavbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* Success header with confetti */}
        <div className="relative text-center mb-10">
          {showConfetti && <Confetti />}
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg"
            style={{ background: "linear-gradient(135deg, hsl(140 60% 90%), hsl(140 55% 82%))" }}
          >
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="font-serif text-4xl font-bold mb-3" style={{ color: "hsl(var(--fp-forest))" }}>
            Order Confirmed! 🌸
          </h1>
          <p className="text-base" style={{ color: "hsl(var(--fp-forest)/0.6)" }}>
            Thank you{order.guest_name ? `, ${order.guest_name}` : ""}! We're preparing your flowers with love.
          </p>
          <div
            className="inline-block mt-3 px-4 py-1.5 rounded-full text-sm font-semibold"
            style={{ background: "hsl(var(--fp-blush)/0.5)", color: "hsl(var(--fp-forest))" }}
          >
            Order #{id?.slice(0, 8).toUpperCase()}
          </div>
        </div>

        {/* Event & Delivery Summary */}
        <div
          className="rounded-3xl border p-6 mb-4"
          style={{ background: "white", borderColor: "hsl(var(--fp-blush)/0.3)" }}
        >
          <h2 className="font-semibold text-base mb-4" style={{ color: "hsl(var(--fp-forest))" }}>
            Order Details
          </h2>
          <div className="grid grid-cols-2 gap-5 text-sm">
            <div>
              <p className="text-xs mb-0.5 font-medium" style={{ color: "hsl(var(--fp-forest)/0.45)" }}>Event</p>
              <p className="font-semibold capitalize" style={{ color: "hsl(var(--fp-forest))" }}>
                {order.event_type}{order.custom_event_name ? ` — ${order.custom_event_name}` : ""}
              </p>
            </div>
            <div>
              <p className="text-xs mb-0.5 font-medium" style={{ color: "hsl(var(--fp-forest)/0.45)" }}>
                <Calendar className="w-3 h-3 inline mr-1" />Event Date
              </p>
              <p className="font-semibold" style={{ color: "hsl(var(--fp-forest))" }}>{order.event_date}</p>
            </div>
            <div>
              <p className="text-xs mb-0.5 font-medium" style={{ color: "hsl(var(--fp-forest)/0.45)" }}>
                <Calendar className="w-3 h-3 inline mr-1" />Delivery Date
              </p>
              <p className="font-semibold" style={{ color: "hsl(var(--fp-forest))" }}>{order.delivery_date}</p>
            </div>
            <div>
              <p className="text-xs mb-0.5 font-medium" style={{ color: "hsl(var(--fp-forest)/0.45)" }}>
                {order.delivery_mode === "delivery"
                  ? <Truck className="w-3 h-3 inline mr-1" />
                  : <MapPin className="w-3 h-3 inline mr-1" />
                }
                Method
              </p>
              <p className="font-semibold capitalize" style={{ color: "hsl(var(--fp-forest))" }}>{order.delivery_mode}</p>
            </div>
          </div>

          {/* Delivery address */}
          {order.delivery_mode === "delivery" && addr?.street && (
            <div
              className="mt-4 pt-4 border-t text-sm"
              style={{ borderColor: "hsl(var(--fp-blush)/0.3)" }}
            >
              <p className="text-xs font-medium mb-1" style={{ color: "hsl(var(--fp-forest)/0.45)" }}>
                Shipping To
              </p>
              <p style={{ color: "hsl(var(--fp-forest))" }}>
                {addr.name && <span className="font-semibold block">{addr.name}</span>}
                {addr.street}, {addr.city}, {addr.state} {addr.zip}
              </p>
            </div>
          )}
        </div>

        {/* Cost summary */}
        <div
          className="rounded-3xl p-6 mb-4"
          style={{ background: "hsl(var(--fp-blush)/0.25)", borderColor: "hsl(var(--fp-blush)/0.4)" }}
        >
          <h2 className="font-semibold text-base mb-3" style={{ color: "hsl(var(--fp-forest))" }}>
            Cost Summary
          </h2>
          <div className="space-y-2 text-sm" style={{ color: "hsl(var(--fp-forest)/0.65)" }}>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>
                {Number(order.shipping_total) === 0
                  ? <span className="text-green-600 font-semibold">Free</span>
                  : `$${Number(order.shipping_total).toFixed(2)}`}
              </span>
            </div>
            <div
              className="flex justify-between font-bold text-base pt-2 border-t"
              style={{ borderColor: "hsl(var(--fp-blush)/0.5)", color: "hsl(var(--fp-forest))" }}
            >
              <span>Total</span>
              <span>${Number(order.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* What's next — timeline */}
        <div
          className="rounded-3xl p-6 mb-8 text-white"
          style={{ background: "linear-gradient(135deg, hsl(var(--fp-forest)) 0%, hsl(150 35% 18%) 100%)" }}
        >
          <h2 className="font-semibold text-base mb-5">What Happens Next?</h2>
          <div className="space-y-4">
            {timeline.map((item, idx) => (
              <div key={item.step} className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm"
                  style={{
                    background: item.done ? "hsl(var(--fp-rose))" : "rgba(255,255,255,0.12)",
                    color: "white",
                  }}
                >
                  {item.done ? "✓" : item.step}
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">{item.title}</p>
                  <p className="text-xs text-white/60 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            to="/flouristPlace"
            className="flex-1 h-12 rounded-2xl font-semibold text-sm flex items-center justify-center border-2 transition-colors"
            style={{
              borderColor: "hsl(var(--fp-blush))",
              color: "hsl(var(--fp-forest))",
            }}
          >
            Back to Home
          </Link>
          <Link
            to="/flouristPlace/products"
            className="flex-1 h-12 rounded-2xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
            style={{ background: "hsl(var(--fp-rose))" }}
          >
            Shop More <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <FPFooter />
    </div>
  );
}
