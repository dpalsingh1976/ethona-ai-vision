import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FPNavbar } from "@/components/flourist-place/layout/FPNavbar";
import { FPFooter } from "@/components/flourist-place/layout/FPFooter";
import { EventDetailsStep } from "@/components/flourist-place/checkout/EventDetailsStep";
import { DeliveryModeStep } from "@/components/flourist-place/checkout/DeliveryModeStep";
import { ReviewStep } from "@/components/flourist-place/checkout/ReviewStep";
import { useFleuristCart } from "@/hooks/useFleuristCart";
import { useFleuristCheckout } from "@/hooks/useFleuristCheckout";
import { CheckCircle2 } from "lucide-react";

const STEPS = ["event", "delivery", "review"] as const;

export default function FlouristPlaceCheckout() {
  const navigate = useNavigate();
  const { items, eventDetails, subtotal, isMixedCart, setEventDetails, clearCart, maxPrepDays } = useFleuristCart();
  const {
    step,
    setStep,
    shippingGroups,
    selectedShipping,
    setSelectedShipping,
    pickupLocations,
    deliveryMode,
    setDeliveryMode,
    selectedPickupLocation,
    setSelectedPickupLocation,
    shippingAddress,
    setShippingAddress,
    isLoadingRules,
    isSubmitting,
    error,
    shippingTotal,
    loadPickupLocations,
    fetchShippingRules,
    submitOrder,
  } = useFleuristCheckout();

  useEffect(() => {
    if (items.length === 0) navigate("/flouristPlace/cart");
  }, [items.length]);

  useEffect(() => {
    loadPickupLocations();
  }, []);

  const handleEventNext = () => {
    setStep("delivery");
    // Trigger shipping rules calculation
    if (deliveryMode === "delivery") {
      fetchShippingRules(items, eventDetails.delivery_date);
    }
  };

  const handleDeliveryModeChange = (mode: "pickup" | "delivery") => {
    setDeliveryMode(mode);
    if (mode === "delivery" && eventDetails.delivery_date) {
      fetchShippingRules(items, eventDetails.delivery_date);
    }
  };

  const handleSubmit = async (guestInfo: { name: string; email: string }) => {
    try {
      const orderId = await submitOrder(items, eventDetails, guestInfo);
      clearCart();
      navigate(`/flouristPlace/order/${orderId}`);
    } catch {
      // error is shown in ReviewStep
    }
  };

  const stepIndex = STEPS.indexOf(step as any);

  return (
    <div className="min-h-screen bg-fp-cream/20 font-sans">
      <FPNavbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Progress steps */}
        <div className="flex items-center justify-between mb-8">
          {["Event Details", "Delivery", "Review"].map((label, i) => (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className={`flex items-center gap-2 ${i <= stepIndex ? "text-fp-rose" : "text-fp-forest/30"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  i < stepIndex ? "bg-fp-rose text-white" :
                  i === stepIndex ? "bg-fp-rose/20 text-fp-rose ring-2 ring-fp-rose" :
                  "bg-fp-blush/20 text-fp-forest/30"
                }`}>
                  {i < stepIndex ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-sm font-medium hidden sm:block">{label}</span>
              </div>
              {i < 2 && (
                <div className={`flex-1 h-0.5 mx-3 ${i < stepIndex ? "bg-fp-rose" : "bg-fp-blush/30"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="bg-white rounded-3xl border border-fp-blush/20 p-6 sm:p-8 shadow-sm">
          {step === "event" && (
            <EventDetailsStep
              details={eventDetails}
              onChange={setEventDetails}
              maxPrepDays={maxPrepDays}
              onNext={handleEventNext}
            />
          )}
          {step === "delivery" && (
            <DeliveryModeStep
              mode={deliveryMode}
              onModeChange={handleDeliveryModeChange}
              pickupLocations={pickupLocations}
              selectedPickup={selectedPickupLocation}
              onPickupSelect={setSelectedPickupLocation}
              shippingGroups={shippingGroups}
              selectedShipping={selectedShipping}
              onShippingSelect={(type, opt) =>
                setSelectedShipping((prev) => ({ ...prev, [type]: opt }))
              }
              isLoadingRules={isLoadingRules}
              items={items}
              onBack={() => setStep("event")}
              onNext={() => setStep("review")}
            />
          )}
          {step === "review" && (
            <ReviewStep
              items={items}
              eventDetails={eventDetails}
              deliveryMode={deliveryMode}
              selectedShipping={selectedShipping}
              shippingTotal={deliveryMode === "pickup" ? 0 : shippingTotal}
              subtotal={subtotal}
              isSubmitting={isSubmitting}
              error={error}
              onBack={() => setStep("delivery")}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>

      <FPFooter />
    </div>
  );
}
