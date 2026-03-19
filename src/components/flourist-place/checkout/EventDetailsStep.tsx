import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays, Info } from "lucide-react";
import type { FPEventDetails } from "@/hooks/useFleuristCart";

const EVENT_TYPES = [
  { value: "wedding", label: "💍 Wedding" },
  { value: "birthday", label: "🎂 Birthday" },
  { value: "pooja", label: "🪔 Pooja / Temple" },
  { value: "anniversary", label: "💑 Anniversary" },
  { value: "festival", label: "🌟 Festival" },
  { value: "housewarming", label: "🏠 Housewarming" },
  { value: "other", label: "✨ Other" },
];

interface EventDetailsStepProps {
  details: FPEventDetails;
  onChange: (details: Partial<FPEventDetails>) => void;
  maxPrepDays: number;
  onNext: () => void;
}

export function EventDetailsStep({ details, onChange, maxPrepDays, onNext }: EventDetailsStepProps) {
  const today = new Date().toISOString().split("T")[0];

  const isValid =
    details.event_type &&
    details.event_date &&
    details.delivery_date &&
    details.delivery_date <= details.event_date;

  const minDeliveryDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + maxPrepDays);
    return d.toISOString().split("T")[0];
  })();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-fp-forest mb-1">Event Details</h2>
        <p className="text-fp-forest/60 text-sm">Tell us about your occasion so we can deliver flowers at the perfect time.</p>
      </div>

      {/* Event Type */}
      <div className="space-y-2">
        <Label className="text-fp-forest font-medium">Event Type *</Label>
        <Select value={details.event_type || ""} onValueChange={(v) => onChange({ event_type: v })}>
          <SelectTrigger className="h-12 rounded-xl border-fp-blush focus:ring-fp-rose">
            <SelectValue placeholder="Select your occasion..." />
          </SelectTrigger>
          <SelectContent>
            {EVENT_TYPES.map((et) => (
              <SelectItem key={et.value} value={et.value}>{et.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Custom event name for "other" */}
      {details.event_type === "other" && (
        <div className="space-y-2">
          <Label className="text-fp-forest font-medium">Event Name *</Label>
          <Input
            value={details.custom_event_name || ""}
            onChange={(e) => onChange({ custom_event_name: e.target.value })}
            placeholder="e.g. Baby shower, Graduation..."
            className="h-12 rounded-xl border-fp-blush focus-visible:ring-fp-rose"
          />
        </div>
      )}

      {/* Event Date */}
      <div className="space-y-2">
        <Label className="text-fp-forest font-medium flex items-center gap-1">
          <CalendarDays className="w-4 h-4 text-fp-rose" /> Event Date *
        </Label>
        <Input
          type="date"
          value={details.event_date || ""}
          min={today}
          onChange={(e) => onChange({ event_date: e.target.value })}
          className="h-12 rounded-xl border-fp-blush focus-visible:ring-fp-rose"
        />
      </div>

      {/* Delivery Date */}
      <div className="space-y-2">
        <Label className="text-fp-forest font-medium flex items-center gap-1">
          <CalendarDays className="w-4 h-4 text-fp-rose" /> Desired Delivery / Pickup Date *
        </Label>
        <Input
          type="date"
          value={details.delivery_date || ""}
          min={minDeliveryDate}
          max={details.event_date || undefined}
          onChange={(e) => onChange({ delivery_date: e.target.value })}
          className="h-12 rounded-xl border-fp-blush focus-visible:ring-fp-rose"
        />
        {maxPrepDays > 0 && (
          <p className="text-xs text-fp-forest/50 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Minimum {maxPrepDays} day{maxPrepDays > 1 ? "s" : ""} prep time required for your items.
          </p>
        )}
        {details.delivery_date && details.event_date && details.delivery_date > details.event_date && (
          <p className="text-xs text-red-500 mt-1">⚠️ Delivery date cannot be after your event date.</p>
        )}
      </div>

      <button
        onClick={onNext}
        disabled={!isValid}
        className="w-full h-12 bg-fp-rose text-white rounded-xl font-medium hover:bg-fp-rose/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue to Delivery Options →
      </button>
    </div>
  );
}
