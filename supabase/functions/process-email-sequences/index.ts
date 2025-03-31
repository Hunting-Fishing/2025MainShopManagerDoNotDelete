
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Parse the request body if any
    const { sequenceId, action } = await req.json();
    
    console.log(`Processing sequences: ${action}, sequenceId: ${sequenceId || 'all'}`);
    
    // Get active sequences
    let sequencesQuery = supabaseClient
      .from('email_sequences')
      .select('*, steps:email_sequence_steps(*)')
      .eq('is_active', true);
      
    // Filter by sequence ID if provided
    if (sequenceId) {
      sequencesQuery = sequencesQuery.eq('id', sequenceId);
    }
    
    const { data: sequences, error: sequencesError } = await sequencesQuery.order('created_at', { ascending: false });
    
    if (sequencesError) {
      throw sequencesError;
    }
    
    console.log(`Found ${sequences.length} active sequences to process`);
    
    // Process each sequence
    const results = await Promise.all(sequences.map(async (sequence) => {
      // Get active enrollments that are due for the next step
      const { data: enrollments, error: enrollmentsError } = await supabaseClient
        .from('email_sequence_enrollments')
        .select('*, customer:customers(id, email, first_name, last_name)')
        .eq('sequence_id', sequence.id)
        .eq('status', 'active')
        .lte('next_send_time', new Date().toISOString());
      
      if (enrollmentsError) {
        console.error(`Error fetching enrollments for sequence ${sequence.id}:`, enrollmentsError);
        return { sequenceId: sequence.id, processed: 0, errors: [enrollmentsError.message] };
      }
      
      console.log(`Found ${enrollments?.length || 0} enrollments ready for next step in sequence ${sequence.id}`);
      
      if (!enrollments || enrollments.length === 0) {
        return { sequenceId: sequence.id, processed: 0, errors: [] };
      }
      
      // Process each enrollment
      const enrollmentResults = await Promise.all(enrollments.map(async (enrollment) => {
        try {
          // 1. Determine current step
          let currentStepId = enrollment.current_step_id;
          let currentStepIndex = -1;
          
          if (currentStepId) {
            currentStepIndex = sequence.steps.findIndex(step => step.id === currentStepId);
          }
          
          // 2. Get the next step
          const nextStepIndex = currentStepIndex + 1;
          
          // If there's no next step, mark enrollment as completed
          if (nextStepIndex >= sequence.steps.length) {
            const { error: completeError } = await supabaseClient
              .from('email_sequence_enrollments')
              .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
                next_send_time: null
              })
              .eq('id', enrollment.id);
              
            if (completeError) {
              throw new Error(`Failed to complete enrollment: ${completeError.message}`);
            }
            
            return { enrollmentId: enrollment.id, status: 'completed' };
          }
          
          const nextStep = sequence.steps[nextStepIndex];
          
          // 3. Process the next step
          if (nextStep.template_id) {
            // Get the email template
            const { data: template, error: templateError } = await supabaseClient
              .from('email_templates')
              .select('*')
              .eq('id', nextStep.template_id)
              .single();
              
            if (templateError) {
              throw new Error(`Failed to get template: ${templateError.message}`);
            }
            
            const customer = enrollment.customer;
            
            if (!customer || !customer.email) {
              throw new Error(`Customer or email missing for enrollment ${enrollment.id}`);
            }
            
            // Apply personalizations to template content and subject
            // First, get standard personalizations
            const standardPersonalizations = {
              first_name: customer.first_name || '',
              last_name: customer.last_name || '',
              full_name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim(),
              email: customer.email,
              sequence_name: sequence.name,
              current_date: new Date().toLocaleDateString(),
            };
            
            // Merge with custom personalizations from enrollment metadata
            const customPersonalizations = enrollment.metadata?.personalizations || {};
            
            // Create the final personalization object
            const personalizations = {
              ...standardPersonalizations,
              ...customPersonalizations,
            };
            
            let emailContent = template.content;
            let emailSubject = template.subject;
            
            // Apply simple template variables
            Object.entries(personalizations).forEach(([key, value]) => {
              const pattern = new RegExp(`{{${key}}}`, 'g');
              emailContent = emailContent.replace(pattern, value as string);
              emailSubject = emailSubject.replace(pattern, value as string);
            });
            
            // Generate a tracking ID
            const trackingId = `${sequence.id}-${enrollment.id}-${nextStep.id}-${Date.now()}`;
            
            // Send the email using Supabase Edge Function
            const emailResponse = await supabaseClient.functions.invoke('send-email', {
              body: {
                to: customer.email,
                subject: emailSubject,
                html: emailContent,
                trackingId,
                sequenceId: sequence.id,
                stepId: nextStep.id,
                enrollmentId: enrollment.id,
                customerId: enrollment.customer_id,
                metadata: {
                  ...enrollment.metadata,
                  segmentData: enrollment.metadata?.segmentData || {},
                }
              }
            });
            
            if (emailResponse.error) {
              throw new Error(`Failed to send email: ${emailResponse.error.message}`);
            }
          }
          
          // 4. Calculate the next send time based on delay in the following step
          let nextSendTime = new Date();
          
          if (nextStepIndex + 1 < sequence.steps.length) {
            const followingStep = sequence.steps[nextStepIndex + 1];
            
            if (followingStep.delay_hours > 0) {
              nextSendTime.setHours(nextSendTime.getHours() + followingStep.delay_hours);
              
              // If business days only, adjust for weekends
              if (followingStep.delay_type === 'business_days') {
                // Check if the next send time falls on a weekend and adjust accordingly
                while (nextSendTime.getDay() === 0 || nextSendTime.getDay() === 6) { // 0 = Sunday, 6 = Saturday
                  nextSendTime.setDate(nextSendTime.getDate() + 1);
                }
              }
            }
          }
          
          // 5. Update the enrollment with the next step and next send time
          const { error: updateError } = await supabaseClient
            .from('email_sequence_enrollments')
            .update({
              current_step_id: nextStep.id,
              next_send_time: nextSendTime.toISOString()
            })
            .eq('id', enrollment.id);
            
          if (updateError) {
            throw new Error(`Failed to update enrollment: ${updateError.message}`);
          }
          
          return { enrollmentId: enrollment.id, status: 'processed', nextStepId: nextStep.id };
        } catch (error) {
          console.error(`Error processing enrollment ${enrollment.id}:`, error);
          return { enrollmentId: enrollment.id, status: 'error', error: error.message };
        }
      }));
      
      const processed = enrollmentResults.filter(r => r.status === 'processed').length;
      const completed = enrollmentResults.filter(r => r.status === 'completed').length;
      const errors = enrollmentResults.filter(r => r.status === 'error').map(r => r.error);
      
      return {
        sequenceId: sequence.id,
        processed,
        completed,
        errors
      };
    }));
    
    // Return the results
    return new Response(
      JSON.stringify({
        success: true,
        processed: results.reduce((sum, r) => sum + r.processed, 0),
        completed: results.reduce((sum, r) => sum + (r.completed || 0), 0),
        results
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );

  } catch (error) {
    console.error("Error processing email sequences:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
});
