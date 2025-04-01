
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
    const { 
      sequenceId, 
      action = 'process', 
      force = false,
      customerId,
      enrollmentId 
    } = await req.json();
    
    // Health check endpoint
    if (action === 'health_check') {
      return new Response(
        JSON.stringify({
          healthy: true,
          timestamp: new Date().toISOString(),
          environment: Deno.env.get("ENVIRONMENT") || 'production'
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }
    
    console.log(`Processing sequences: ${action}, sequenceId: ${sequenceId || 'all'}, customerId: ${customerId || 'all'}, enrollmentId: ${enrollmentId || 'none'}`);
    
    // Handle specific enrollment processing
    if (action === 'process_enrollment' && enrollmentId) {
      const { data: enrollment, error: enrollmentError } = await supabaseClient
        .from('email_sequence_enrollments')
        .select('*, customer:customers(*), current_step:current_step_id(*), sequence:sequence_id(*)')
        .eq('id', enrollmentId)
        .eq('status', 'active')
        .single();
        
      if (enrollmentError) {
        throw new Error(`Failed to get enrollment: ${enrollmentError.message}`);
      }
      
      if (!enrollment) {
        throw new Error(`Enrollment ${enrollmentId} not found or not active`);
      }
      
      const result = await processEnrollment(supabaseClient, enrollment, force);
      
      return new Response(
        JSON.stringify({
          success: true,
          enrollment: enrollmentId,
          result
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }
    
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
      let enrollmentsQuery = supabaseClient
        .from('email_sequence_enrollments')
        .select('*, customer:customers(*)')
        .eq('sequence_id', sequence.id)
        .eq('status', 'active');
        
      // Add time condition if not forcing processing
      if (!force) {
        enrollmentsQuery = enrollmentsQuery.lte('next_send_time', new Date().toISOString());
      }
      
      // Filter by customer ID if provided
      if (customerId) {
        enrollmentsQuery = enrollmentsQuery.eq('customer_id', customerId);
      }
      
      const { data: enrollments, error: enrollmentsError } = await enrollmentsQuery;
      
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
        return await processEnrollment(supabaseClient, enrollment, force, sequence);
      }));
      
      const processed = enrollmentResults.filter(r => r.status === 'processed').length;
      const completed = enrollmentResults.filter(r => r.status === 'completed').length;
      const errors = enrollmentResults.filter(r => r.status === 'error').map(r => r.error);
      
      // Update sequence analytics after processing
      await updateSequenceAnalytics(supabaseClient, sequence.id);
      
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

/**
 * Process a single enrollment
 */
async function processEnrollment(supabaseClient, enrollment, force = false, sequence = null) {
  try {
    // If sequence wasn't provided in the enrollment, fetch it
    if (!sequence) {
      const { data: sequenceData, error: sequenceError } = await supabaseClient
        .from('email_sequences')
        .select('*, steps:email_sequence_steps(*)')
        .eq('id', enrollment.sequence_id)
        .single();
        
      if (sequenceError) {
        throw new Error(`Failed to get sequence: ${sequenceError.message}`);
      }
      
      sequence = sequenceData;
    }
    
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
          next_send_time: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', enrollment.id);
        
      if (completeError) {
        throw new Error(`Failed to complete enrollment: ${completeError.message}`);
      }
      
      // Record completion event
      await recordEnrollmentEvent(supabaseClient, enrollment.id, 'completed', {
        sequence_id: sequence.id,
        completed_at: new Date().toISOString()
      });
      
      return { enrollmentId: enrollment.id, status: 'completed' };
    }
    
    const nextStep = sequence.steps[nextStepIndex];
    
    // Skip inactive steps
    if (nextStep.is_active === false) {
      console.log(`Skipping inactive step ${nextStep.id} for enrollment ${enrollment.id}`);
      
      // Update enrollment to skip this step
      const { error: skipError } = await supabaseClient
        .from('email_sequence_enrollments')
        .update({
          current_step_id: nextStep.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', enrollment.id);
        
      if (skipError) {
        throw new Error(`Failed to skip inactive step: ${skipError.message}`);
      }
      
      // Record skip event
      await recordEnrollmentEvent(supabaseClient, enrollment.id, 'step_skipped', {
        step_id: nextStep.id,
        reason: 'inactive_step'
      });
      
      // Process the next step immediately (recursive call)
      return await processEnrollment(supabaseClient, {
        ...enrollment,
        current_step_id: nextStep.id
      }, force, sequence);
    }
    
    // Check step conditions if any
    if (nextStep.condition_type && !await checkStepCondition(supabaseClient, enrollment, nextStep)) {
      console.log(`Condition not met for step ${nextStep.id}, enrollment ${enrollment.id}`);
      
      // Update enrollment to skip this step
      const { error: conditionError } = await supabaseClient
        .from('email_sequence_enrollments')
        .update({
          current_step_id: nextStep.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', enrollment.id);
        
      if (conditionError) {
        throw new Error(`Failed to update step after condition check: ${conditionError.message}`);
      }
      
      // Record condition event
      await recordEnrollmentEvent(supabaseClient, enrollment.id, 'step_skipped', {
        step_id: nextStep.id,
        reason: 'condition_not_met',
        condition: {
          type: nextStep.condition_type,
          value: nextStep.condition_value,
          operator: nextStep.condition_operator
        }
      });
      
      // Process the next step immediately (recursive call)
      return await processEnrollment(supabaseClient, {
        ...enrollment,
        current_step_id: nextStep.id
      }, force, sequence);
    }
    
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
        emailContent = emailContent.replace(pattern, String(value));
        emailSubject = emailSubject.replace(pattern, String(value));
      });
      
      // Generate a tracking ID
      const trackingId = `${sequence.id}-${enrollment.id}-${nextStep.id}-${Date.now()}`;
      
      // Record email prepared event
      await recordEnrollmentEvent(supabaseClient, enrollment.id, 'email_prepared', {
        step_id: nextStep.id,
        template_id: template.id,
        tracking_id: trackingId
      });
      
      try {
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
        
        // Record email sent event
        await recordEnrollmentEvent(supabaseClient, enrollment.id, 'email_sent', {
          step_id: nextStep.id,
          template_id: template.id,
          tracking_id: trackingId,
          email_response: emailResponse.data
        });
      } catch (sendError) {
        console.error(`Error sending email for enrollment ${enrollment.id}:`, sendError);
        
        // Record email failed event
        await recordEnrollmentEvent(supabaseClient, enrollment.id, 'email_failed', {
          step_id: nextStep.id,
          template_id: template.id,
          tracking_id: trackingId,
          error: sendError.message
        });
        
        // Continue with the sequence despite email failure
        console.log(`Continuing sequence despite email failure for enrollment ${enrollment.id}`);
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
        next_send_time: nextSendTime.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', enrollment.id);
      
    if (updateError) {
      throw new Error(`Failed to update enrollment: ${updateError.message}`);
    }
    
    return { enrollmentId: enrollment.id, status: 'processed', nextStepId: nextStep.id };
  } catch (error) {
    console.error(`Error processing enrollment ${enrollment.id}:`, error);
    
    // Record error event
    try {
      await recordEnrollmentEvent(supabaseClient, enrollment.id, 'error', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } catch (eventError) {
      console.error(`Error recording event for enrollment ${enrollment.id}:`, eventError);
    }
    
    return { enrollmentId: enrollment.id, status: 'error', error: error.message };
  }
}

/**
 * Check if a step condition is met
 */
async function checkStepCondition(supabaseClient, enrollment, step) {
  try {
    if (!step.condition_type || !step.condition_value || !step.condition_operator) {
      return true; // No condition to check
    }
    
    // Handle different condition types
    switch (step.condition_type) {
      case 'event': {
        // Check if the customer has performed a specific event
        const eventName = step.condition_value;
        const { count, error } = await supabaseClient
          .from('email_events')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', enrollment.customer_id)
          .eq('event_type', eventName);
          
        if (error) throw error;
        
        // "=" operator means the event should exist, "!=" means it should not exist
        return step.condition_operator === '=' ? count > 0 : count === 0;
      }
      
      case 'property': {
        // Check a property in the enrollment metadata
        if (!enrollment.metadata) return false;
        
        // Parse property path with dot notation support
        const propertyPath = step.condition_value.split('.');
        let value = enrollment.metadata;
        
        // Navigate to the nested property
        for (const key of propertyPath) {
          if (value === undefined || value === null) return false;
          value = value[key];
        }
        
        // Compare the value based on the operator
        switch (step.condition_operator) {
          case '=': return value == step.condition_value;
          case '!=': return value != step.condition_value;
          case '>': return value > step.condition_value;
          case '<': return value < step.condition_value;
          case '>=': return value >= step.condition_value;
          case '<=': return value <= step.condition_value;
          default: return false;
        }
      }
      
      default:
        return true; // Unknown condition type, assume it passes
    }
  } catch (error) {
    console.error(`Error checking condition for step ${step.id}:`, error);
    return false; // Fail closed for safety
  }
}

/**
 * Record an enrollment event
 */
async function recordEnrollmentEvent(supabaseClient, enrollmentId, eventType, eventData = {}) {
  try {
    const { error } = await supabaseClient
      .from('email_sequence_enrollment_events')
      .insert({
        enrollment_id: enrollmentId,
        event_type: eventType,
        event_data: eventData,
        created_at: new Date().toISOString()
      });
      
    if (error) {
      console.error(`Error recording enrollment event: ${error.message}`);
    }
  } catch (error) {
    console.error(`Error recording enrollment event: ${error.message}`);
  }
}

/**
 * Update sequence analytics
 */
async function updateSequenceAnalytics(supabaseClient, sequenceId) {
  try {
    // Count enrollments by status
    const { data: statusCounts, error: countError } = await supabaseClient
      .from('email_sequence_enrollments')
      .select('status', { count: 'exact', head: true })
      .eq('sequence_id', sequenceId)
      .eq('status', 'active');
      
    if (countError) throw countError;
    
    const { count: activeEnrollments } = statusCounts || { count: 0 };
    
    const { data: completedData, error: completedError } = await supabaseClient
      .from('email_sequence_enrollments')
      .select('status', { count: 'exact', head: true })
      .eq('sequence_id', sequenceId)
      .eq('status', 'completed');
      
    if (completedError) throw completedError;
    
    const { count: completedEnrollments } = completedData || { count: 0 };
    
    const { data: totalData, error: totalError } = await supabaseClient
      .from('email_sequence_enrollments')
      .select('status', { count: 'exact', head: true })
      .eq('sequence_id', sequenceId);
      
    if (totalError) throw totalError;
    
    const { count: totalEnrollments } = totalData || { count: 0 };
    
    // Calculate conversion rate
    const conversionRate = totalEnrollments > 0 
      ? (completedEnrollments / totalEnrollments) * 100 
      : 0;
    
    // Calculate average time to complete for completed enrollments
    const { data: completedEnrollmentData, error: timeError } = await supabaseClient
      .from('email_sequence_enrollments')
      .select('started_at, completed_at')
      .eq('sequence_id', sequenceId)
      .eq('status', 'completed')
      .not('completed_at', 'is', null);
      
    if (timeError) throw timeError;
    
    let totalTimeMs = 0;
    let completedCount = 0;
    
    for (const enrollment of completedEnrollmentData || []) {
      if (enrollment.started_at && enrollment.completed_at) {
        const startTime = new Date(enrollment.started_at).getTime();
        const endTime = new Date(enrollment.completed_at).getTime();
        totalTimeMs += (endTime - startTime);
        completedCount++;
      }
    }
    
    const averageTimeToComplete = completedCount > 0 
      ? totalTimeMs / completedCount 
      : 0;
    
    // Get count of emails sent
    const { count: emailsSent, error: emailError } = await supabaseClient
      .from('email_sequence_enrollment_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'email_sent')
      .like('event_data->>sequence_id', sequenceId);
      
    if (emailError) console.error(`Error counting emails: ${emailError.message}`);
    
    // Upsert analytics
    const { error: upsertError } = await supabaseClient
      .from('email_sequence_analytics')
      .upsert({
        sequence_id: sequenceId,
        total_enrollments: totalEnrollments,
        active_enrollments: activeEnrollments,
        completed_enrollments: completedEnrollments,
        conversion_rate: conversionRate,
        average_time_to_complete: averageTimeToComplete,
        updated_at: new Date().toISOString()
      });
      
    if (upsertError) throw upsertError;
    
    console.log(`Updated analytics for sequence ${sequenceId}`);
    return true;
  } catch (error) {
    console.error(`Error updating sequence analytics: ${error.message}`);
    return false;
  }
}
