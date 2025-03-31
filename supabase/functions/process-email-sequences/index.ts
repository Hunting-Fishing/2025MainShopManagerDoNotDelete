
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EnrollmentProcessRequest {
  sequenceId?: string;
  action?: 'process' | 'updateAnalytics';
  customerId?: string;
  stepId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { sequenceId, action, customerId } = await req.json() as EnrollmentProcessRequest;

    // Process based on action
    if (action === 'updateAnalytics') {
      return await updateSequenceAnalytics(supabase, sequenceId);
    } else {
      return await processSequenceEnrollments(supabase);
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function processSequenceEnrollments(supabase) {
  console.log("Processing sequence enrollments...");
  
  // Get all active enrollments that are due for processing
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from('email_sequence_enrollments')
    .select('*, sequence:email_sequences(*)')
    .eq('status', 'active')
    .lte('next_send_time', new Date().toISOString());
  
  if (enrollmentsError) {
    throw new Error(`Error fetching enrollments: ${enrollmentsError.message}`);
  }
  
  console.log(`Found ${enrollments?.length || 0} enrollments to process`);
  
  if (!enrollments || enrollments.length === 0) {
    return new Response(
      JSON.stringify({ message: "No enrollments to process" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
  
  const processedResults = [];
  
  for (const enrollment of enrollments) {
    try {
      // Get the sequence with its steps
      const { data: steps, error: stepsError } = await supabase
        .from('email_sequence_steps')
        .select('*')
        .eq('sequence_id', enrollment.sequence_id)
        .order('position', { ascending: true });
      
      if (stepsError) {
        throw new Error(`Error fetching steps: ${stepsError.message}`);
      }
      
      // Check if sequence is active
      if (!enrollment.sequence.is_active) {
        console.log(`Sequence ${enrollment.sequence_id} is inactive, skipping enrollment ${enrollment.id}`);
        continue;
      }
      
      // Process the enrollment
      const result = await processEnrollment(supabase, enrollment, steps);
      processedResults.push(result);
    } catch (error) {
      console.error(`Error processing enrollment ${enrollment.id}:`, error);
      processedResults.push({
        enrollment_id: enrollment.id,
        status: 'error',
        message: error.message,
      });
    }
  }
  
  // Update analytics for all affected sequences
  const affectedSequenceIds = [...new Set(enrollments.map(e => e.sequence_id))];
  for (const sequenceId of affectedSequenceIds) {
    await updateSequenceAnalytics(supabase, sequenceId);
  }
  
  return new Response(
    JSON.stringify({
      processed: processedResults.length,
      results: processedResults,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

async function processEnrollment(supabase, enrollment, steps) {
  console.log(`Processing enrollment ${enrollment.id} for sequence ${enrollment.sequence_id}`);
  
  // Sort steps by position
  const sortedSteps = steps.sort((a, b) => a.position - b.position);
  
  // Determine current step
  let currentStep;
  let nextStep;
  
  if (!enrollment.current_step_id) {
    // First step
    currentStep = sortedSteps[0];
  } else {
    // Find current step
    const currentIndex = sortedSteps.findIndex(step => step.id === enrollment.current_step_id);
    if (currentIndex === -1) {
      throw new Error(`Current step ${enrollment.current_step_id} not found in sequence`);
    }
    
    currentStep = sortedSteps[currentIndex];
    
    // Find next step
    if (currentIndex < sortedSteps.length - 1) {
      nextStep = sortedSteps[currentIndex + 1];
    }
  }
  
  // Get customer information
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('id, email, first_name, last_name')
    .eq('id', enrollment.customer_id)
    .single();
  
  if (customerError) {
    throw new Error(`Error fetching customer: ${customerError.message}`);
  }
  
  // Get email template
  const { data: template, error: templateError } = await supabase
    .from('email_templates')
    .select('*')
    .eq('id', currentStep.template_id)
    .single();
  
  if (templateError) {
    throw new Error(`Error fetching template: ${templateError.message}`);
  }
  
  // Check if conditions are met for the current step
  if (currentStep.condition_type) {
    const conditionMet = await checkCondition(
      supabase,
      currentStep.condition_type,
      currentStep.condition_value,
      currentStep.condition_operator,
      customer.id,
      enrollment
    );
    
    if (!conditionMet) {
      console.log(`Condition not met for step ${currentStep.id}, skipping to next step`);
      // Skip this step and move to the next one
      if (nextStep) {
        // Update enrollment with next step
        const { error: updateError } = await supabase
          .from('email_sequence_enrollments')
          .update({
            current_step_id: nextStep.id,
            next_send_time: calculateNextSendTime(nextStep),
          })
          .eq('id', enrollment.id);
        
        if (updateError) {
          throw new Error(`Error updating enrollment: ${updateError.message}`);
        }
        
        return {
          enrollment_id: enrollment.id,
          status: 'skipped',
          next_step_id: nextStep.id,
          next_send_time: calculateNextSendTime(nextStep),
        };
      } else {
        // This was the last step, mark enrollment as completed
        const { error: completeError } = await supabase
          .from('email_sequence_enrollments')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            next_send_time: null,
          })
          .eq('id', enrollment.id);
        
        if (completeError) {
          throw new Error(`Error completing enrollment: ${completeError.message}`);
        }
        
        return {
          enrollment_id: enrollment.id,
          status: 'completed',
          message: 'Sequence completed (condition not met for last step)',
        };
      }
    }
  }
  
  // Send the email (this is a mock, would be replaced with actual email sending logic)
  console.log(`Sending email to ${customer.email} using template ${template.name}`);
  
  // Record that the email was sent
  const { data: communicationData, error: communicationError } = await supabase
    .from('customer_communications')
    .insert({
      customer_id: customer.id,
      type: 'email',
      direction: 'outbound',
      subject: template.subject,
      content: template.content,
      template_id: template.id,
      template_name: template.name,
      staff_member_id: 'system',
      staff_member_name: 'Email Sequence System',
      status: 'sent',
    })
    .select()
    .single();
  
  if (communicationError) {
    throw new Error(`Error recording communication: ${communicationError.message}`);
  }
  
  // If there's a next step, update the enrollment
  if (nextStep) {
    const nextSendTime = calculateNextSendTime(nextStep);
    
    const { error: updateError } = await supabase
      .from('email_sequence_enrollments')
      .update({
        current_step_id: nextStep.id,
        next_send_time: nextSendTime,
      })
      .eq('id', enrollment.id);
    
    if (updateError) {
      throw new Error(`Error updating enrollment: ${updateError.message}`);
    }
    
    return {
      enrollment_id: enrollment.id,
      status: 'processed',
      email_sent: true,
      next_step_id: nextStep.id,
      next_send_time: nextSendTime,
    };
  } else {
    // This was the last step, mark enrollment as completed
    const { error: completeError } = await supabase
      .from('email_sequence_enrollments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        next_send_time: null,
      })
      .eq('id', enrollment.id);
    
    if (completeError) {
      throw new Error(`Error completing enrollment: ${completeError.message}`);
    }
    
    return {
      enrollment_id: enrollment.id,
      status: 'completed',
      email_sent: true,
      message: 'Sequence completed',
    };
  }
}

async function checkCondition(supabase, conditionType, conditionValue, conditionOperator, customerId, enrollment) {
  if (!conditionType || !conditionValue) {
    return true; // No condition, so it's met by default
  }
  
  if (conditionType === 'event') {
    // Check if the event has occurred
    // This is a simplified implementation - in a real app, you'd check your event tracking system
    
    // For this example, let's check customer_communications for email opens/clicks
    const { count, error } = await supabase
      .from('customer_communications')
      .select('id', { count: 'exact' })
      .eq('customer_id', customerId)
      .eq('type', 'email')
      .eq('status', conditionValue === 'email_opened' ? 'opened' : 'clicked')
      .gte('date', enrollment.started_at); // Only check events after sequence started
    
    if (error) {
      console.error('Error checking event condition:', error);
      return false;
    }
    
    return count > 0;
  } else if (conditionType === 'property') {
    // Check a customer property against a value
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();
    
    if (error) {
      console.error('Error fetching customer for condition check:', error);
      return false;
    }
    
    // Parse the property path (could be nested like custom_fields.subscription_tier)
    const propertyPath = conditionValue.split('.');
    let propertyValue = customer;
    
    for (const segment of propertyPath) {
      if (propertyValue === undefined || propertyValue === null) {
        return false;
      }
      propertyValue = propertyValue[segment];
    }
    
    // Compare with the operator
    switch (conditionOperator) {
      case '=':
        return propertyValue == enrollment.metadata?.comparison_value;
      case '!=':
        return propertyValue != enrollment.metadata?.comparison_value;
      case '>':
        return propertyValue > enrollment.metadata?.comparison_value;
      case '<':
        return propertyValue < enrollment.metadata?.comparison_value;
      case '>=':
        return propertyValue >= enrollment.metadata?.comparison_value;
      case '<=':
        return propertyValue <= enrollment.metadata?.comparison_value;
      default:
        return false;
    }
  }
  
  return true;
}

function calculateNextSendTime(step) {
  const now = new Date();
  
  if (step.delay_hours <= 0) {
    return now.toISOString(); // Send immediately
  }
  
  if (step.delay_type === 'fixed') {
    // Simple delay in hours
    const nextTime = new Date(now.getTime() + step.delay_hours * 60 * 60 * 1000);
    return nextTime.toISOString();
  } else if (step.delay_type === 'business_days') {
    // Business days logic (simplified)
    let hoursRemaining = step.delay_hours;
    let currentTime = now.getTime();
    
    while (hoursRemaining > 0) {
      currentTime += 1 * 60 * 60 * 1000; // Add 1 hour
      const currentDate = new Date(currentTime);
      const dayOfWeek = currentDate.getDay();
      const hour = currentDate.getHours();
      
      // Skip non-business hours (assuming 9-5, Mon-Fri)
      if (dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 9 && hour < 17) {
        hoursRemaining--;
      }
    }
    
    return new Date(currentTime).toISOString();
  }
  
  // Default fallback
  return new Date(now.getTime() + step.delay_hours * 60 * 60 * 1000).toISOString();
}

async function updateSequenceAnalytics(supabase, sequenceId) {
  console.log(`Updating analytics for sequence ${sequenceId}`);
  
  if (!sequenceId) {
    throw new Error("Sequence ID is required for updating analytics");
  }
  
  // Get enrollment counts
  const { data: enrollmentStats, error: statsError } = await supabase
    .from('email_sequence_enrollments')
    .select('status, count', { count: 'exact' })
    .eq('sequence_id', sequenceId)
    .or('status.eq.active,status.eq.completed')
    .group('status');
  
  if (statsError) {
    throw new Error(`Error getting enrollment stats: ${statsError.message}`);
  }
  
  // Parse counts
  const totalEnrollments = enrollmentStats.reduce((sum, stat) => sum + parseInt(stat.count), 0);
  const activeEnrollments = enrollmentStats.find(stat => stat.status === 'active')?.count || 0;
  const completedEnrollments = enrollmentStats.find(stat => stat.status === 'completed')?.count || 0;
  
  // Calculate average time to complete (for completed enrollments)
  let averageTimeToComplete = null;
  if (completedEnrollments > 0) {
    const { data: completedData, error: completedError } = await supabase
      .from('email_sequence_enrollments')
      .select('started_at, completed_at')
      .eq('sequence_id', sequenceId)
      .eq('status', 'completed')
      .not('completed_at', 'is', null);
    
    if (completedError) {
      throw new Error(`Error getting completed enrollments: ${completedError.message}`);
    }
    
    if (completedData && completedData.length > 0) {
      const totalHours = completedData.reduce((sum, enrollment) => {
        const startTime = new Date(enrollment.started_at).getTime();
        const endTime = new Date(enrollment.completed_at).getTime();
        const hours = (endTime - startTime) / (1000 * 60 * 60);
        return sum + hours;
      }, 0);
      
      averageTimeToComplete = totalHours / completedData.length;
    }
  }
  
  // Calculate conversion rate
  const conversionRate = totalEnrollments > 0 
    ? (completedEnrollments / totalEnrollments) 
    : 0;
  
  // Upsert analytics data
  const { data: analyticsData, error: upsertError } = await supabase
    .from('email_sequence_analytics')
    .upsert({
      sequence_id: sequenceId,
      total_enrollments: totalEnrollments,
      active_enrollments: activeEnrollments,
      completed_enrollments: completedEnrollments,
      conversion_rate: conversionRate,
      average_time_to_complete: averageTimeToComplete,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'sequence_id',
    })
    .select();
  
  if (upsertError) {
    throw new Error(`Error upserting analytics: ${upsertError.message}`);
  }
  
  return new Response(
    JSON.stringify({
      success: true,
      analytics: analyticsData[0],
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}
