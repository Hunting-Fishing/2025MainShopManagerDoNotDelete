
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailQueueItem {
  id: string;
  sequence_id: string;
  step_id: string;
  customer_id: string;
  customer_email: string;
  template_id: string;
  scheduled_time: string;
  variables: Record<string, string>;
  status: 'pending' | 'sent' | 'failed';
}

interface SequenceStep {
  id: string;
  sequence_id: string;
  name: string;
  template_id: string;
  delay_hours: number;
  delay_type: string;
  condition_type: string | null;
  condition_value: string | null;
  condition_operator: string | null;
  is_active: boolean;
  position: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  
  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if this is a background scheduled run or a manual invocation
    const isManualInvoke = req.method === "POST";
    
    if (isManualInvoke) {
      const { sequenceId, customerId } = await req.json();
      
      // Validate inputs
      if (!sequenceId || !customerId) {
        return new Response(
          JSON.stringify({ error: "Missing required parameters" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      // Get customer details
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('email, first_name, last_name')
        .eq('id', customerId)
        .single();
      
      if (customerError || !customerData) {
        console.error('Error fetching customer:', customerError);
        return new Response(
          JSON.stringify({ error: "Customer not found" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      // Get sequence details
      const { data: sequenceData, error: sequenceError } = await supabase
        .from('email_sequences')
        .select('name, is_active')
        .eq('id', sequenceId)
        .single();
      
      if (sequenceError || !sequenceData) {
        console.error('Error fetching sequence:', sequenceError);
        return new Response(
          JSON.stringify({ error: "Sequence not found" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (!sequenceData.is_active) {
        return new Response(
          JSON.stringify({ error: "Sequence is not active" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      // Get the first step of the sequence
      const { data: stepData, error: stepError } = await supabase
        .from('email_sequence_steps')
        .select('id, template_id, delay_hours, delay_type')
        .eq('sequence_id', sequenceId)
        .eq('position', 1)
        .eq('is_active', true)
        .single();
      
      if (stepError || !stepData) {
        console.error('Error fetching first step:', stepError);
        return new Response(
          JSON.stringify({ error: "No active steps found for this sequence" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      // Calculate when to send the first email based on the step delay
      const scheduledTime = new Date();
      scheduledTime.setHours(scheduledTime.getHours() + stepData.delay_hours);
      
      // Create enrollment record
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('email_sequence_enrollments')
        .insert({
          sequence_id: sequenceId,
          customer_id: customerId,
          current_step_id: stepData.id,
          status: 'active',
          next_send_time: scheduledTime.toISOString()
        })
        .select('id')
        .single();
      
      if (enrollmentError) {
        console.error('Error creating enrollment:', enrollmentError);
        return new Response(
          JSON.stringify({ error: "Failed to enroll customer in sequence" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      // Update analytics
      await supabase
        .from('email_sequence_analytics')
        .upsert({
          sequence_id: sequenceId,
          total_enrollments: 1,
          active_enrollments: 1,
          completed_enrollments: 0,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'sequence_id',
          ignoreDuplicates: false
        });
      
      // Queue the first email
      const { data: queueData, error: queueError } = await supabase
        .from('email_queue')
        .insert({
          sequence_id: sequenceId,
          step_id: stepData.id,
          customer_id: customerId,
          customer_email: customerData.email,
          template_id: stepData.template_id,
          scheduled_time: scheduledTime.toISOString(),
          variables: {
            first_name: customerData.first_name || 'Customer',
            last_name: customerData.last_name || '',
            sequence_name: sequenceData.name
          },
          status: 'pending'
        })
        .select('id')
        .single();
      
      if (queueError) {
        console.error('Error queueing email:', queueError);
        return new Response(
          JSON.stringify({ error: "Failed to queue email" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Customer enrolled in sequence successfully",
          enrollmentId: enrollmentData.id,
          nextStepId: stepData.id,
          scheduledTime: scheduledTime.toISOString()
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      // This is an automated run - process all pending emails and sequence enrollments
      const now = new Date();
      
      // Process enrollments that are due for next steps
      const { data: dueEnrollments, error: enrollmentsError } = await supabase
        .from('email_sequence_enrollments')
        .select(`
          id,
          sequence_id,
          customer_id,
          current_step_id,
          status,
          next_send_time,
          customers!inner(
            email,
            first_name,
            last_name
          )
        `)
        .eq('status', 'active')
        .lte('next_send_time', now.toISOString());
      
      if (enrollmentsError) {
        console.error('Error fetching due enrollments:', enrollmentsError);
        throw enrollmentsError;
      }
      
      let processedCount = 0;
      
      // Process each enrollment
      for (const enrollment of (dueEnrollments || [])) {
        try {
          // Get current step
          const { data: currentStep, error: currentStepError } = await supabase
            .from('email_sequence_steps')
            .select('position, sequence_id')
            .eq('id', enrollment.current_step_id)
            .single();
          
          if (currentStepError) {
            console.error('Error fetching current step:', currentStepError);
            continue;
          }
          
          // Get next step
          const { data: nextSteps, error: nextStepError } = await supabase
            .from('email_sequence_steps')
            .select('id, template_id, delay_hours, delay_type')
            .eq('sequence_id', enrollment.sequence_id)
            .eq('position', currentStep.position + 1)
            .eq('is_active', true)
            .order('position', { ascending: true });
          
          if (nextStepError) {
            console.error('Error fetching next step:', nextStepError);
            continue;
          }
          
          if (nextSteps.length === 0) {
            // No more steps, complete the sequence
            await supabase
              .from('email_sequence_enrollments')
              .update({
                status: 'completed',
                completed_at: now.toISOString()
              })
              .eq('id', enrollment.id);
            
            // Update analytics
            await supabase
              .from('email_sequence_analytics')
              .update({
                active_enrollments: supabase.rpc('decrement', { value: 1 }),
                completed_enrollments: supabase.rpc('increment', { value: 1 }),
                updated_at: now.toISOString()
              })
              .eq('sequence_id', enrollment.sequence_id);
            
            processedCount++;
            continue;
          }
          
          const nextStep = nextSteps[0];
          
          // Calculate when to send the next email based on the step delay
          const nextSendTime = new Date();
          nextSendTime.setHours(nextSendTime.getHours() + nextStep.delay_hours);
          
          // Get sequence name for personalization
          const { data: sequenceData } = await supabase
            .from('email_sequences')
            .select('name')
            .eq('id', enrollment.sequence_id)
            .single();
          
          // Update enrollment with new step and send time
          await supabase
            .from('email_sequence_enrollments')
            .update({
              current_step_id: nextStep.id,
              next_send_time: nextSendTime.toISOString()
            })
            .eq('id', enrollment.id);
          
          // Queue the next email
          await supabase
            .from('email_queue')
            .insert({
              sequence_id: enrollment.sequence_id,
              step_id: nextStep.id,
              customer_id: enrollment.customer_id,
              customer_email: enrollment.customers.email,
              template_id: nextStep.template_id,
              scheduled_time: nextSendTime.toISOString(),
              variables: {
                first_name: enrollment.customers.first_name || 'Customer',
                last_name: enrollment.customers.last_name || '',
                sequence_name: sequenceData?.name || 'Our service'
              },
              status: 'pending'
            });
          
          processedCount++;
        } catch (error) {
          console.error('Error processing enrollment:', error);
          continue;
        }
      }
      
      // Return summary of processed items
      return new Response(
        JSON.stringify({ 
          success: true, 
          processedEnrollments: processedCount
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error('Error processing email sequences:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
