import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Loader2, ExternalLink, Clock, ChevronDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Industry options
const industries = [
  "Restaurant",
  "Medical / Dental",
  "Real Estate",
  "Legal",
  "Retail",
  "Service Business",
  "Other",
] as const;

// Growth goal options
const growthGoals = [
  "More calls & bookings",
  "More website leads",
  "Better online visibility",
  "Automating customer follow-ups",
  "Not sure",
] as const;

// Lead tracking options
const leadTrackingOptions = ["Yes", "No", "Not sure"] as const;

// Validation schema
const intakeSchema = z.object({
  fullName: z.string().min(1, "Name is required").max(100, "Name is too long"),
  businessName: z.string().min(1, "Business name is required").max(150, "Business name is too long"),
  email: z.string().email("Please enter a valid email").max(255),
  phone: z.string().max(20).optional().or(z.literal("")),
  website: z.string().url("Please enter a valid URL").max(255).optional().or(z.literal("")),
  industry: z.enum(industries, { required_error: "Please select your industry" }),
  location: z.string().min(1, "Location is required").max(100, "Location is too long"),
  growthGoal: z.enum(growthGoals, { required_error: "Please select your primary goal" }),
  leadTracking: z.enum(leadTrackingOptions, { required_error: "Please select an option" }),
  biggestChallenge: z.string().max(1000, "Please keep your response under 1000 characters").optional(),
});

type IntakeFormData = z.infer<typeof intakeSchema>;

const GrowthAssessment = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, touchedFields },
  } = useForm<IntakeFormData>({
    resolver: zodResolver(intakeSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      businessName: "",
      email: "",
      phone: "",
      website: "",
      location: "",
      biggestChallenge: "",
    },
  });

  const watchedFields = watch();

  // Calculate progress based on filled fields
  const progress = useMemo(() => {
    const requiredFields = ["fullName", "businessName", "email", "industry", "location", "growthGoal", "leadTracking"];
    const filledRequired = requiredFields.filter((field) => {
      const value = watchedFields[field as keyof IntakeFormData];
      return value && value.toString().trim() !== "";
    }).length;
    return Math.round((filledRequired / requiredFields.length) * 100);
  }, [watchedFields]);

  const onSubmit = async (data: IntakeFormData) => {
    setIsSubmitting(true);

    try {
      // Save to database
      const { error: dbError } = await supabase.from("intake_submissions").insert({
        full_name: data.fullName,
        business_name: data.businessName,
        email: data.email,
        phone: data.phone || null,
        website: data.website || null,
        industry: data.industry,
        location: data.location,
        growth_goal: data.growthGoal,
        lead_tracking: data.leadTracking,
        biggest_challenge: data.biggestChallenge || null,
      });

      if (dbError) {
        console.error("Database error:", dbError);
        throw new Error("Failed to save submission");
      }

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke("send-intake-email", {
        body: {
          fullName: data.fullName,
          businessName: data.businessName,
          email: data.email,
          phone: data.phone || null,
          website: data.website || null,
          industry: data.industry,
          location: data.location,
          growthGoal: data.growthGoal,
          leadTracking: data.leadTracking,
          biggestChallenge: data.biggestChallenge || null,
        },
      });

      if (emailError) {
        console.error("Email error:", emailError);
        // Don't throw - submission was saved, email is secondary
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Radio card component for better touch targets
  const RadioCard = ({
    name,
    value,
    label,
    selected,
    onChange,
  }: {
    name: string;
    value: string;
    label: string;
    selected: boolean;
    onChange: (value: string) => void;
  }) => (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border bg-background hover:border-primary/50 hover:bg-muted/50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            selected ? "border-primary bg-primary" : "border-muted-foreground/40"
          }`}
        >
          {selected && <Check className="w-3 h-3 text-primary-foreground" />}
        </div>
        <span className={`text-sm font-medium ${selected ? "text-foreground" : "text-muted-foreground"}`}>
          {label}
        </span>
      </div>
    </button>
  );

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-gradient-to-br from-[#FDE9DD] to-[#FFF8EE] flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">
              Your Growth Report is Being Prepared
            </h1>
            <p className="text-muted-foreground mb-8">
              Thank you for your submission! Our team will analyze your business and prepare a personalized growth strategy.
            </p>
            <Button
              asChild
              className="w-full h-14 text-lg rounded-full bg-primary hover:bg-primary/90"
            >
              <a href="/contact" className="inline-flex items-center justify-center gap-2">
                Book a 15-Minute Review Call
                <ExternalLink className="w-5 h-5" />
              </a>
            </Button>
            <p className="text-xs text-muted-foreground mt-6">
              We'll reach out within 24 hours with your report.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-br from-[#FDE9DD] to-[#FFF8EE]">
        {/* Progress indicator */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-border/50">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between text-sm mb-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>60 seconds • 10 questions</span>
              </div>
              <span className="font-medium text-primary">{progress}% complete</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Hero section */}
        <div className="max-w-2xl mx-auto px-4 pt-16 pb-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Get Your Free Growth Report
          </h1>
          <p className="text-muted-foreground text-lg">
            Answer a few quick questions and we'll prepare a personalized strategy to grow your business.
          </p>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto px-4 pb-16">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white rounded-3xl shadow-xl p-6 md:p-8 space-y-6"
          >
            {/* Contact Information Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                Contact Information
              </h2>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  {...register("fullName")}
                  placeholder="John Smith"
                  className={`h-12 rounded-xl ${errors.fullName ? "border-destructive" : ""}`}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName.message}</p>
                )}
              </div>

              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="businessName" className="text-sm font-medium">
                  Business Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="businessName"
                  {...register("businessName")}
                  placeholder="Smith's Restaurant"
                  className={`h-12 rounded-xl ${errors.businessName ? "border-destructive" : ""}`}
                />
                {errors.businessName && (
                  <p className="text-sm text-destructive">{errors.businessName.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="john@example.com"
                  className={`h-12 rounded-xl ${errors.email ? "border-destructive" : ""}`}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Phone & Website in grid on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register("phone")}
                    placeholder="(555) 123-4567"
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="text-sm font-medium">
                    Business Website
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    {...register("website")}
                    placeholder="https://example.com"
                    className={`h-12 rounded-xl ${errors.website ? "border-destructive" : ""}`}
                  />
                  <p className="text-xs text-muted-foreground">Leave blank if you don't have one yet</p>
                  {errors.website && (
                    <p className="text-sm text-destructive">{errors.website.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Business Details Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                Business Details
              </h2>

              {/* Industry */}
              <div className="space-y-2">
                <Label htmlFor="industry" className="text-sm font-medium">
                  Industry <span className="text-destructive">*</span>
                </Label>
                <Select
                  onValueChange={(value) => setValue("industry", value as typeof industries[number], { shouldValidate: true })}
                >
                  <SelectTrigger className={`h-12 rounded-xl ${errors.industry ? "border-destructive" : ""}`}>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.industry && (
                  <p className="text-sm text-destructive">{errors.industry.message}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">
                  Business Location <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="location"
                  {...register("location")}
                  placeholder="City, State"
                  className={`h-12 rounded-xl ${errors.location ? "border-destructive" : ""}`}
                />
                {errors.location && (
                  <p className="text-sm text-destructive">{errors.location.message}</p>
                )}
              </div>
            </div>

            {/* Growth Assessment Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                Growth Assessment
              </h2>

              {/* Primary Growth Goal */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  What's your primary growth goal? <span className="text-destructive">*</span>
                </Label>
                <div className="space-y-2">
                  {growthGoals.map((goal) => (
                    <RadioCard
                      key={goal}
                      name="growthGoal"
                      value={goal}
                      label={goal}
                      selected={watchedFields.growthGoal === goal}
                      onChange={(value) => setValue("growthGoal", value as typeof growthGoals[number], { shouldValidate: true })}
                    />
                  ))}
                </div>
                {errors.growthGoal && (
                  <p className="text-sm text-destructive">{errors.growthGoal.message}</p>
                )}
              </div>

              {/* Lead Tracking */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Do you currently track customer inquiries or leads? <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {leadTrackingOptions.map((option) => (
                    <RadioCard
                      key={option}
                      name="leadTracking"
                      value={option}
                      label={option}
                      selected={watchedFields.leadTracking === option}
                      onChange={(value) => setValue("leadTracking", value as typeof leadTrackingOptions[number], { shouldValidate: true })}
                    />
                  ))}
                </div>
                {errors.leadTracking && (
                  <p className="text-sm text-destructive">{errors.leadTracking.message}</p>
                )}
              </div>

              {/* Biggest Challenge */}
              <div className="space-y-2">
                <Label htmlFor="biggestChallenge" className="text-sm font-medium">
                  What's your biggest challenge in getting more customers right now?
                </Label>
                <Textarea
                  id="biggestChallenge"
                  {...register("biggestChallenge")}
                  placeholder="Tell us about your biggest growth challenge..."
                  className="min-h-[100px] rounded-xl resize-none"
                />
                {errors.biggestChallenge && (
                  <p className="text-sm text-destructive">{errors.biggestChallenge.message}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 text-lg font-semibold rounded-full bg-primary hover:bg-primary/90 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Get My Free Growth Report"
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-4">
                Your information is used only to prepare your personalized growth report.
              </p>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GrowthAssessment;
