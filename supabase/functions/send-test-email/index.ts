
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@1.0.0";

// Get the Resend API key from the environment variables
const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
const resend = new Resend(resendApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestEmailRequest {
  templateId: string;
  recipientEmail: string;
  personalizations?: Record<string, string>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const { templateId, recipientEmail, personalizations = {} } = await req.json() as TestEmailRequest;

    // Validate request
    if (!templateId) {
      return new Response(JSON.stringify({ error: "Template ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!recipientEmail) {
      return new Response(JSON.stringify({ error: "Recipient email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Fetch the template from Supabase
    const { data: templateData, error: templateError } = await req.supabaseClient
      .from("email_templates")
      .select("*")
      .eq("id", templateId)
      .single();

    if (templateError) {
      return new Response(JSON.stringify({ error: "Template not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Process the template content - replace variables with personalization values
    let htmlContent = templateData.content;
    let subject = templateData.subject;

    // Replace variables in the template content
    Object.entries(personalizations).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      htmlContent = htmlContent.replace(regex, value);
      subject = subject.replace(regex, value);
    });

    // For any remaining variables, use default values from template
    if (templateData.variables) {
      templateData.variables.forEach((variable: { name: string; default_value: string }) => {
        const regex = new RegExp(`{{${variable.name}}}`, "g");
        htmlContent = htmlContent.replace(regex, variable.default_value || '');
        subject = subject.replace(regex, variable.default_value || '');
      });
    }

    // Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: "noreply@yourdomain.com",
      to: recipientEmail,
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      console.error("Resend API error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
