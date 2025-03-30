
// Supabase Edge Function for processing email sequences
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log("Process Email Sequences function starting...");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if this is a scheduled invocation or manual
    const isScheduled = req.headers.get('Authorization') === `Bearer ${Deno.env.get('CRON_SECRET')}`;
    console.log(`Invocation type: ${isScheduled ? 'Scheduled' : 'Manual'}`);

    // Get all active sequence enrollments due for next step
    const now = new Date().toISOString();
    const { data: enrollments, error: enrollmentsError } = await supabaseClient
      .from('email_sequence_enrollments')
      .select(`
        id,
        sequence_id,
        customer_id,
        current_step_id,
        status,
        next_send_time,
        metadata,
        email_sequences(
          id,
          name,
          steps
        ),
        customers(
          id,
          email,
          first_name,
          last_name,
          custom_fields
        )
      `)
      .eq('status', 'active')
      .lte('next_send_time', now)
      .limit(50);

    if (enrollmentsError) {
      throw enrollmentsError;
    }

    console.log(`Found ${enrollments?.length || 0} enrollments to process`);

    // Process each enrollment
    const results = [];
    if (enrollments && enrollments.length > 0) {
      for (const enrollment of enrollments) {
        try {
          // Get the sequence and steps
          const sequence = enrollment.email_sequences;
          const steps = sequence.steps;
          
          // Get customer data
          const customer = enrollment.customers;
          
          // Find current or next step
          let currentStepIndex = 0;
          if (enrollment.current_step_id) {
            const stepIndex = steps.findIndex(step => step.id === enrollment.current_step_id);
            if (stepIndex >= 0) {
              currentStepIndex = stepIndex + 1; // Move to next step
              if (currentStepIndex >= steps.length) {
                // Complete the sequence if no more steps
                await completeEnrollment(supabaseClient, enrollment.id, sequence.id);
                results.push({
                  enrollment_id: enrollment.id,
                  status: 'completed',
                  reason: 'All steps completed'
                });
                continue;
              }
            }
          }
          
          const currentStep = steps[currentStepIndex];
          
          // Check if step is active
          if (!currentStep.isActive) {
            // Skip to next step
            results.push({
              enrollment_id: enrollment.id,
              status: 'skipped',
              reason: 'Step is inactive'
            });
            continue;
          }
          
          // Check step conditions if any
          if (currentStep.condition) {
            const conditionMet = await evaluateCondition(
              supabaseClient, 
              enrollment.id, 
              customer.id, 
              currentStep.condition
            );
            
            if (!conditionMet) {
              // Skip to next step
              results.push({
                enrollment_id: enrollment.id,
                status: 'skipped',
                reason: 'Condition not met'
              });
              continue;
            }
          }
          
          // Send the email
          const sentResult = await sendSequenceEmail(
            supabaseClient,
            currentStep.templateId,
            customer,
            enrollment
          );
          
          // Update enrollment with next step
          await updateEnrollmentStep(
            supabaseClient,
            enrollment.id,
            currentStep.id,
            currentStepIndex,
            steps.length,
            currentStep.delayHours,
            sequence.id
          );
          
          results.push({
            enrollment_id: enrollment.id,
            status: 'processed',
            email_sent: sentResult.success,
            next_step: currentStepIndex < steps.length - 1 ? steps[currentStepIndex + 1].name : 'none'
          });
        } catch (enrollmentError) {
          console.error(`Error processing enrollment ${enrollment.id}:`, enrollmentError);
          results.push({
            enrollment_id: enrollment.id,
            status: 'error',
            error: enrollmentError.message
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: enrollments?.length || 0,
        results
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error("Error in process-email-sequences function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }
});

// Helper functions
async function completeEnrollment(supabase, enrollmentId, sequenceId) {
  // Update enrollment status
  const { error } = await supabase
    .from('email_sequence_enrollments')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      next_send_time: null
    })
    .eq('id', enrollmentId);
  
  if (error) throw error;
}

async function evaluateCondition(supabase, enrollmentId, customerId, condition) {
  // For now, we'll assume conditions are met
  // In a real implementation, we would evaluate based on:
  // - Events (email_opened, link_clicked, etc.)
  // - Customer properties
  return true;
}

async function sendSequenceEmail(supabase, templateId, customer, enrollment) {
  // Get template
  const { data: template, error: templateError } = await supabase
    .from('email_templates')
    .select('*')
    .eq('id', templateId)
    .single();
  
  if (templateError) throw templateError;
  
  // Prepare email data
  const emailData = {
    to: customer.email,
    from: 'your-service@example.com',
    subject: template.subject,
    html: template.content,
    customer_id: customer.id,
    template_id: templateId,
    sequence_id: enrollment.sequence_id,
    enrollment_id: enrollment.id
  };
  
  // In a production system, you would send via your email provider
  console.log(`Would send email: "${template.subject}" to ${customer.email}`);
  
  // Log the sent email
  const { error: logError } = await supabase
    .from('email_logs')
    .insert({
      email: customer.email,
      template_id: templateId,
      sequence_id: enrollment.sequence_id,
      enrollment_id: enrollment.id,
      customer_id: customer.id,
      subject: template.subject,
      status: 'sent',
      metadata: {
        step_id: enrollment.current_step_id
      }
    });
  
  if (logError) throw logError;
  
  return { success: true };
}

async function updateEnrollmentStep(
  supabase,
  enrollmentId,
  stepId,
  currentIndex,
  totalSteps,
  delayHours,
  sequenceId
) {
  const isLastStep = currentIndex >= totalSteps - 1;
  
  // Calculate next send time
  const nextSendTime = isLastStep 
    ? null 
    : new Date(Date.now() + (delayHours * 60 * 60 * 1000)).toISOString();
  
  // Update enrollment
  const { error } = await supabase
    .from('email_sequence_enrollments')
    .update({
      current_step_id: stepId,
      next_send_time: nextSendTime,
      status: isLastStep ? 'completed' : 'active',
      completed_at: isLastStep ? new Date().toISOString() : null
    })
    .eq('id', enrollmentId);
  
  if (error) throw error;
}
