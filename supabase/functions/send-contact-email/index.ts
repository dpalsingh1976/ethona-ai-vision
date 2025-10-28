import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validation schema for contact form inputs
const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  message: z.string().trim().min(1, "Message is required").max(2000, "Message must be less than 2000 characters"),
});

interface ContactEmailRequest {
  name: string;
  email: string;
  message: string;
}

// Simple HTML escaping to prevent XSS
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

// Rate limiting using Deno KV
async function checkRateLimit(clientIp: string): Promise<{ allowed: boolean; remaining: number }> {
  const kv = await Deno.openKv();
  const key = ["rate_limit", "contact_form", clientIp];
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour window
  const maxRequests = 3; // 3 requests per hour

  const result = await kv.get(key);
  const data = result.value as { count: number; resetAt: number } | null;

  if (!data || now > data.resetAt) {
    // First request or window expired - create new window
    await kv.set(key, { count: 1, resetAt: now + windowMs }, { expireIn: windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (data.count >= maxRequests) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0 };
  }

  // Increment counter
  await kv.set(key, { count: data.count + 1, resetAt: data.resetAt }, { expireIn: data.resetAt - now });
  return { allowed: true, remaining: maxRequests - data.count - 1 };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";

    // Check rate limit
    const rateLimit = await checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      console.log("Rate limit exceeded for IP:", clientIp);
      return new Response(
        JSON.stringify({ 
          error: "Too many requests. Please try again later.",
          remaining: 0 
        }),
        {
          status: 429,
          headers: { 
            "Content-Type": "application/json",
            "X-RateLimit-Remaining": "0",
            ...corsHeaders 
          },
        }
      );
    }

    // Parse and validate input
    const body = await req.json();
    const validated = contactSchema.parse(body);

    console.log("Sending contact form notification for:", { 
      name: validated.name, 
      email: validated.email,
      ip: clientIp 
    });

    // Escape HTML to prevent XSS
    const safeName = escapeHtml(validated.name);
    const safeEmail = escapeHtml(validated.email);
    const safeMessage = escapeHtml(validated.message);

    // Send notification email to Ethona Digital Lab
    const emailResponse = await resend.emails.send({
      from: "Ethona Contact Form <noreply@ethonadigitallab.com>",
      to: ["info@ethonadigitallab.com"],
      replyTo: validated.email,
      subject: `New Contact Form Submission from ${safeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
            <p style="margin: 10px 0;"><strong>Name:</strong> ${safeName}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${safeEmail}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #1e3a8a;">Message:</h3>
            <p style="line-height: 1.6; white-space: pre-wrap;">${safeMessage}</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          
          <p style="font-size: 12px; color: #6b7280;">
            This email was sent from the Ethona Digital Lab contact form.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      data: emailResponse,
      remaining: rateLimit.remaining 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    
    // Handle validation errors with more specific messages
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => e.message).join(", ");
      return new Response(
        JSON.stringify({ error: `Validation failed: ${messages}` }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    return new Response(
      JSON.stringify({ error: "Failed to send message. Please try again later." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
