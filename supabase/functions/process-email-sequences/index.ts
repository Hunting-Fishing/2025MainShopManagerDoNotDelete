
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "npm:resend@1.0.0";

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

  // Initialize Resend for email sending
  const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
  const resend = new Resend(resendApiKey);

  try {
    const { sequenceId, action, customerId } = await req.json() as EnrollmentProcessRequest;

    // Process based on action
    if (action === 'updateAnalytics') {
      return await updateSequenceAnalytics(supabase, sequenceId);
    } else {
      return await processSequenceEnrollments(supabase, resend);
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

async function processSequenceEnrollments(supabase, resend) {
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
      const result = await processEnrollment(supabase, resend, enrollment, steps);
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

async function processEnrollment(supabase, resend, enrollment, steps) {
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
    .select('id, email, first_name, last_name, custom_fields, last_activity_date')
    .eq('id', enrollment.customer_id)
    .single();
  
  if (customerError) {
    throw new Error(`Error fetching customer: ${customerError.message}`);
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
            step_history: updateStepHistory(enrollment, currentStep.id, 'skipped', 'Condition not met'),
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
          reason: 'Condition not met',
        };
      } else {
        // This was the last step, mark enrollment as completed
        const { error: completeError } = await supabase
          .from('email_sequence_enrollments')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            next_send_time: null,
            step_history: updateStepHistory(enrollment, currentStep.id, 'skipped', 'Last step, condition not met'),
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
  
  // For email steps, get the template and send the email
  if (currentStep.type === 'email') {
    // Get email template
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', currentStep.email_template_id || currentStep.templateId)
      .single();
    
    if (templateError) {
      throw new Error(`Error fetching template: ${templateError.message}`);
    }
    
    // Send the email
    console.log(`Sending email to ${customer.email} using template ${template.name}`);
    
    try {
      // Personalize the email content
      const personalizedSubject = personalizeText(template.subject, customer);
      const personalizedContent = personalizeText(template.content, customer);
      
      // Generate tracking ID
      const trackingId = crypto.randomUUID();
      
      // Add tracking pixel and link tracking
      const trackingPixel = `<img src="${Deno.env.get("SUPABASE_URL")}/functions/track-email-open?t=${trackingId}&s=${enrollment.sequence_id}&r=${customer.id}" width="1" height="1" alt="" style="display:block">`;
      
      let htmlContent = personalizedContent;
      
      // Add tracking pixel
      if (htmlContent.includes('</body>')) {
        htmlContent = htmlContent.replace('</body>', `${trackingPixel}</body>`);
      } else {
        htmlContent = `${htmlContent}${trackingPixel}`;
      }
      
      // Process links for click tracking
      const linkRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(https?:\/\/[^"']+)\1/gi;
      let match;
      while ((match = linkRegex.exec(htmlContent)) !== null) {
        const originalUrl = match[2];
        const trackingUrl = `${Deno.env.get("SUPABASE_URL")}/functions/track-email-click?t=${trackingId}&s=${enrollment.sequence_id}&r=${customer.id}&u=${encodeURIComponent(originalUrl)}`;
        htmlContent = htmlContent.replace(`href="${originalUrl}"`, `href="${trackingUrl}"`);
      }
      
      // Get sender information
      const { data: shopData } = await supabase
        .from('shops')
        .select('name, email')
        .eq('id', enrollment.sequence.shop_id)
        .single();
      
      const senderName = shopData?.name || 'Your Company';
      const senderEmail = shopData?.email || 'noreply@example.com';
      
      // Send the email using Resend
      const emailResult = await resend.emails.send({
        from: `${senderName} <${senderEmail}>`,
        to: customer.email,
        subject: personalizedSubject,
        html: htmlContent,
        tags: [
          { name: 'sequence_id', value: enrollment.sequence_id },
          { name: 'step_id', value: currentStep.id },
          { name: 'customer_id', value: customer.id }
        ]
      });
      
      console.log('Email sent:', emailResult);
      
      // Record that the email was sent
      const { data: communicationData, error: communicationError } = await supabase
        .from('customer_communications')
        .insert({
          customer_id: customer.id,
          type: 'email',
          direction: 'outbound',
          subject: personalizedSubject,
          content: htmlContent,
          template_id: template.id,
          template_name: template.name,
          staff_member_id: 'system',
          staff_member_name: 'Email Sequence System',
          status: 'sent',
          sequence_id: enrollment.sequence_id,
          sequence_step_id: currentStep.id,
          tracking_id: trackingId
        })
        .select()
        .single();
      
      if (communicationError) {
        throw new Error(`Error recording communication: ${communicationError.message}`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  } else if (currentStep.type === 'delay') {
    // This is a delay step, just log it
    console.log(`Processed delay step of ${currentStep.delayHours || currentStep.delay_duration} hours for enrollment ${enrollment.id}`);
  }
  
  // If there's a next step, update the enrollment
  if (nextStep) {
    const nextSendTime = calculateNextSendTime(nextStep);
    
    const { error: updateError } = await supabase
      .from('email_sequence_enrollments')
      .update({
        current_step_id: nextStep.id,
        next_send_time: nextSendTime,
        step_history: updateStepHistory(enrollment, currentStep.id, 'processed'),
      })
      .eq('id', enrollment.id);
    
    if (updateError) {
      throw new Error(`Error updating enrollment: ${updateError.message}`);
    }
    
    return {
      enrollment_id: enrollment.id,
      status: 'processed',
      email_sent: currentStep.type === 'email',
      delay_processed: currentStep.type === 'delay',
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
        step_history: updateStepHistory(enrollment, currentStep.id, 'processed'),
      })
      .eq('id', enrollment.id);
    
    if (completeError) {
      throw new Error(`Error completing enrollment: ${completeError.message}`);
    }
    
    return {
      enrollment_id: enrollment.id,
      status: 'completed',
      email_sent: currentStep.type === 'email',
      delay_processed: currentStep.type === 'delay',
      message: 'Sequence completed',
    };
  }
}

function personalizeText(text, customer) {
  if (!text) return '';
  
  // Basic personalization tags
  return text
    .replace(/{{first_name}}/g, customer.first_name || '')
    .replace(/{{last_name}}/g, customer.last_name || '')
    .replace(/{{email}}/g, customer.email || '')
    .replace(/{{full_name}}/g, `${customer.first_name || ''} ${customer.last_name || ''}`.trim());
}

function updateStepHistory(enrollment, stepId, status, note = null) {
  let history = [];
  
  // Parse existing history if it exists
  try {
    if (enrollment.step_history) {
      history = typeof enrollment.step_history === 'string' 
        ? JSON.parse(enrollment.step_history) 
        : enrollment.step_history;
    }
  } catch (e) {
    console.error("Error parsing step history:", e);
    history = [];
  }
  
  // Add new history entry
  history.push({
    step_id: stepId,
    status: status,
    timestamp: new Date().toISOString(),
    note: note
  });
  
  return JSON.stringify(history);
}

async function checkCondition(supabase, conditionType, conditionValue, conditionOperator, customerId, enrollment) {
  if (!conditionType || !conditionValue) {
    return true; // No condition, so it's met by default
  }
  
  console.log(`Checking condition: ${conditionType} ${conditionValue} ${conditionOperator || '='}`);
  
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
      .gte('created_at', enrollment.started_at || enrollment.created_at); // Only check events after sequence started
    
    if (error) {
      console.error('Error checking event condition:', error);
      return false;
    }
    
    const result = count > 0;
    console.log(`Event condition result: ${result} (found ${count} events)`);
    return result;
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
    
    // If propertyValue is still undefined, check enrollment metadata
    if (propertyValue === undefined && enrollment.metadata) {
      const metadataValue = enrollment.metadata[conditionValue];
      if (metadataValue !== undefined) {
        propertyValue = metadataValue;
      }
    }
    
    // Get comparison value
    const comparisonValue = enrollment.metadata?.comparison_value;
    
    if (propertyValue === undefined || comparisonValue === undefined) {
      console.log(`Property condition not met: missing values to compare`);
      return false;
    }
    
    let result = false;
    
    // Compare with the operator
    switch (conditionOperator) {
      case '=':
      case '==':
        result = propertyValue == comparisonValue;
        break;
      case '!=':
        result = propertyValue != comparisonValue;
        break;
      case '>':
        result = propertyValue > comparisonValue;
        break;
      case '<':
        result = propertyValue < comparisonValue;
        break;
      case '>=':
        result = propertyValue >= comparisonValue;
        break;
      case '<=':
        result = propertyValue <= comparisonValue;
        break;
      case 'contains':
        result = String(propertyValue).includes(String(comparisonValue));
        break;
      case 'startsWith':
        result = String(propertyValue).startsWith(String(comparisonValue));
        break;
      case 'endsWith':
        result = String(propertyValue).endsWith(String(comparisonValue));
        break;
      default:
        result = false;
    }
    
    console.log(`Property condition result: ${result} (${propertyValue} ${conditionOperator} ${comparisonValue})`);
    return result;
  }
  
  return true;
}

function calculateNextSendTime(step) {
  const now = new Date();
  
  // For email steps with no delay, send immediately
  if (step.type === 'email' && !step.delayHours && !step.delay_duration) {
    return now.toISOString();
  }
  
  // For delay steps, calculate the next send time
  const delayHours = step.delayHours || parseInt(step.delay_duration) || 0;
  if (delayHours <= 0) {
    return now.toISOString(); // Send immediately
  }
  
  const delayType = step.delayType || 'fixed';
  
  if (delayType === 'fixed') {
    // Simple delay in hours
    const nextTime = new Date(now.getTime() + delayHours * 60 * 60 * 1000);
    return nextTime.toISOString();
  } else if (delayType === 'business_days') {
    // Business days logic (more sophisticated implementation)
    let hoursRemaining = delayHours;
    let currentTime = now.getTime();
    
    while (hoursRemaining > 0) {
      currentTime += 1 * 60 * 60 * 1000; // Add 1 hour
      const currentDate = new Date(currentTime);
      const dayOfWeek = currentDate.getDay();
      const hour = currentDate.getHours();
      
      // Skip non-business hours (weekends and outside 9-5)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
        if (hour >= 9 && hour < 17) { // 9 AM to 5 PM
          hoursRemaining--;
        }
      }
    }
    
    return new Date(currentTime).toISOString();
  } else if (delayType === 'smart_timing') {
    // Smart timing tries to send at optimal times based on recipient's timezone
    // (basic implementation - would be more sophisticated in production)
    const baseTime = new Date(now.getTime() + delayHours * 60 * 60 * 1000);
    const hour = baseTime.getHours();
    
    // If outside 9 AM to 8 PM, adjust to next day at 10 AM
    if (hour < 9 || hour > 20) {
      baseTime.setDate(baseTime.getDate() + 1);
      baseTime.setHours(10, 0, 0, 0);
    }
    
    return baseTime.toISOString();
  }
  
  // Default fallback
  return new Date(now.getTime() + delayHours * 60 * 60 * 1000).toISOString();
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
      .select('created_at, completed_at')
      .eq('sequence_id', sequenceId)
      .eq('status', 'completed')
      .not('completed_at', 'is', null);
    
    if (completedError) {
      throw new Error(`Error getting completed enrollments: ${completedError.message}`);
    }
    
    if (completedData && completedData.length > 0) {
      const totalHours = completedData.reduce((sum, enrollment) => {
        const startTime = new Date(enrollment.created_at).getTime();
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
