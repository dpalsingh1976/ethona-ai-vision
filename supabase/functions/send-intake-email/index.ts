import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validation schema
const intakeSchema = z.object({
  fullName: z.string().min(1).max(100),
  businessName: z.string().min(1).max(150),
  email: z.string().email().max(255),
  phone: z.string().max(20).optional().nullable(),
  website: z.string().max(255).optional().nullable(),
  industry: z.string().min(1),
  location: z.string().min(1).max(100),
  growthGoal: z.string().min(1),
  leadTracking: z.string().min(1),
  biggestChallenge: z.string().max(1000).optional().nullable(),
});

type IntakeEmailRequest = z.infer<typeof intakeSchema>;

// Rate limiting with Deno KV
const kv = await Deno.openKv();

async function checkRateLimit(clientIp: string): Promise<{ allowed: boolean; remaining: number }> {
  const key = ["intake_rate_limit", clientIp];
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 3;

  const entry = await kv.get<{ count: number; windowStart: number }>(key);
  
  if (!entry.value || now - entry.value.windowStart > windowMs) {
    await kv.set(key, { count: 1, windowStart: now }, { expireIn: windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.value.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  await kv.set(key, { count: entry.value.count + 1, windowStart: entry.value.windowStart }, { expireIn: windowMs });
  return { allowed: true, remaining: maxRequests - entry.value.count - 1 };
}

// Escape HTML to prevent XSS
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") || 
                     "unknown";

    // Check rate limit
    const { allowed, remaining } = await checkRateLimit(clientIp);
    if (!allowed) {
      return new Response(
        JSON.stringify({ error: "Too many submissions. Please try again later." }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "X-RateLimit-Remaining": "0"
          } 
        }
      );
    }

    // Parse and validate request
    const body = await req.json();
    const validationResult = intakeSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: "Validation failed", 
          details: validationResult.error.flatten().fieldErrors 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const data = validationResult.data;

    // Escape all user input
    const safeName = escapeHtml(data.fullName);
    const safeBusinessName = escapeHtml(data.businessName);
    const safeEmail = escapeHtml(data.email);
    const safePhone = data.phone ? escapeHtml(data.phone) : "Not provided";
    const safeWebsite = data.website ? escapeHtml(data.website) : "Not provided";
    const safeIndustry = escapeHtml(data.industry);
    const safeLocation = escapeHtml(data.location);
    const safeGrowthGoal = escapeHtml(data.growthGoal);
    const safeLeadTracking = escapeHtml(data.leadTracking);
    const safeBiggestChallenge = data.biggestChallenge ? escapeHtml(data.biggestChallenge) : "Not provided";

    // Create JSON data for CRM integration
    const jsonData = JSON.stringify({
      timestamp: new Date().toISOString(),
      contact: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || null,
      },
      business: {
        name: data.businessName,
        website: data.website || null,
        industry: data.industry,
        location: data.location,
      },
      assessment: {
        growthGoal: data.growthGoal,
        leadTracking: data.leadTracking,
        biggestChallenge: data.biggestChallenge || null,
      },
    }, null, 2);

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Ethona Digital Lab <onboarding@resend.dev>",
      to: ["info@ethonadigitallab.com"],
      subject: `New Growth Assessment: ${safeBusinessName} - ${safeIndustry}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #E07A5F, #F4A261); padding: 20px; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
            .section { margin-bottom: 20px; }
            .section h2 { color: #E07A5F; font-size: 18px; margin-bottom: 10px; border-bottom: 2px solid #E07A5F; padding-bottom: 5px; }
            .field { margin-bottom: 8px; }
            .label { font-weight: bold; color: #555; }
            .value { color: #333; }
            .highlight { background: #FFF8EE; padding: 15px; border-radius: 8px; border-left: 4px solid #E07A5F; margin: 15px 0; }
            .json-block { background: #1a1a1a; color: #00ff00; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 12px; overflow-x: auto; white-space: pre-wrap; }
            .cta { text-align: center; margin-top: 20px; }
            .cta a { background: #E07A5F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 New Growth Assessment Submission</h1>
            </div>
            <div class="content">
              <div class="section">
                <h2>📋 Contact Information</h2>
                <div class="field"><span class="label">Name:</span> <span class="value">${safeName}</span></div>
                <div class="field"><span class="label">Email:</span> <span class="value">${safeEmail}</span></div>
                <div class="field"><span class="label">Phone:</span> <span class="value">${safePhone}</span></div>
              </div>
              
              <div class="section">
                <h2>🏢 Business Details</h2>
                <div class="field"><span class="label">Business Name:</span> <span class="value">${safeBusinessName}</span></div>
                <div class="field"><span class="label">Website:</span> <span class="value">${safeWebsite}</span></div>
                <div class="field"><span class="label">Industry:</span> <span class="value">${safeIndustry}</span></div>
                <div class="field"><span class="label">Location:</span> <span class="value">${safeLocation}</span></div>
              </div>
              
              <div class="section">
                <h2>🎯 Growth Assessment</h2>
                <div class="highlight">
                  <div class="field"><span class="label">Primary Growth Goal:</span><br><span class="value">${safeGrowthGoal}</span></div>
                </div>
                <div class="field"><span class="label">Currently Tracking Leads:</span> <span class="value">${safeLeadTracking}</span></div>
                <div class="field"><span class="label">Biggest Challenge:</span><br><span class="value">${safeBiggestChallenge}</span></div>
              </div>
              
              <div class="section">
                <h2>🔧 CRM Data (JSON)</h2>
                <pre class="json-block">${escapeHtml(jsonData)}</pre>
              </div>
              
              <div class="cta">
                <p><strong>Ready to follow up?</strong></p>
                <a href="mailto:${safeEmail}?subject=Your%20Growth%20Report%20-%20${encodeURIComponent(safeBusinessName)}">Reply to ${safeName}</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Intake email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Submission received" }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": remaining.toString()
        } 
      }
    );
  } catch (error: any) {
    console.error("Error in send-intake-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
};

serve(handler);
