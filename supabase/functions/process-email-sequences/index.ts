
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { Resend } from 'npm:resend@2.0.0'

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Initialize Resend for sending emails
const resendApiKey = Deno.env.get('RESEND_API_KEY') || ''
const resend = new Resend(resendApiKey)

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Type definitions
interface EmailSequence {
  id: string
  name: string
  description?: string
  isActive: boolean
  triggerType: 'manual' | 'event' | 'schedule'
  triggerEvent?: string
  steps: EmailSequenceStep[]
}

interface EmailSequenceStep {
  id: string
  name: string
  templateId: string
  delayHours: number
  delayType: 'fixed' | 'business_days'
  position: number
  isActive: boolean
  condition?: {
    type: 'event' | 'property'
    value: string
    operator: '=' | '!=' | '>' | '<' | '>=' | '<='
  }
}

interface EmailSequenceEnrollment {
  id: string
  sequenceId: string
  customerId: string
  currentStepId?: string
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  startedAt: string
  completedAt?: string
  nextSendTime?: string
  metadata?: Record<string, any>
}

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface EmailTemplate {
  id: string
  subject: string
  content: string
  variables: { name: string; defaultValue: string }[]
}

// Process scheduled sequence emails
async function processScheduledEmails() {
  console.log('Processing scheduled sequence emails...')
  
  const now = new Date()
  
  // Get active enrollments with next send time <= now
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from('email_sequence_enrollments')
    .select('*')
    .eq('status', 'active')
    .lte('next_send_time', now.toISOString())
  
  if (enrollmentsError) {
    console.error('Error fetching enrollments:', enrollmentsError)
    return
  }
  
  console.log(`Found ${enrollments?.length || 0} enrollments to process`)
  
  // Process each enrollment
  for (const enrollment of enrollments || []) {
    await processEnrollment(enrollment)
  }
  
  console.log('Finished processing scheduled sequence emails')
}

// Process a single enrollment
async function processEnrollment(enrollment: EmailSequenceEnrollment) {
  console.log(`Processing enrollment ${enrollment.id} for sequence ${enrollment.sequenceId}`)
  
  try {
    // Get the sequence
    const { data: sequence, error: sequenceError } = await supabase
      .from('email_sequences')
      .select(`
        *,
        steps:email_sequence_steps(*)
      `)
      .eq('id', enrollment.sequenceId)
      .single()
    
    if (sequenceError) {
      console.error('Error fetching sequence:', sequenceError)
      return
    }
    
    // Get the customer
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, first_name, last_name, email')
      .eq('id', enrollment.customerId)
      .single()
    
    if (customerError) {
      console.error('Error fetching customer:', customerError)
      return
    }
    
    // Check if customer has email
    if (!customer.email) {
      console.error(`Customer ${customer.id} has no email address`)
      return
    }
    
    // Determine the current step
    let currentStep
    
    if (enrollment.currentStepId) {
      // Find the current step in the sequence
      currentStep = sequence.steps.find((step: EmailSequenceStep) => step.id === enrollment.currentStepId)
    } else {
      // If no current step, start with the first step
      currentStep = sequence.steps.sort((a: EmailSequenceStep, b: EmailSequenceStep) => a.position - b.position)[0]
    }
    
    if (!currentStep) {
      console.error(`No steps found for sequence ${sequence.id}`)
      return
    }
    
    // Check step conditions if any
    if (currentStep.condition && !await evaluateCondition(currentStep.condition, enrollment.customerId)) {
      console.log(`Condition not met for step ${currentStep.id}, skipping to next step`)
      await moveToNextStep(enrollment, sequence.steps, currentStep)
      return
    }
    
    // Get the email template
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', currentStep.templateId)
      .single()
    
    if (templateError) {
      console.error('Error fetching template:', templateError)
      return
    }
    
    // Send the email
    const success = await sendEmail(template, customer)
    
    if (success) {
      // Record the email was sent
      await supabase
        .from('email_sequence_steps_sent')
        .insert({
          enrollment_id: enrollment.id,
          step_id: currentStep.id,
          sent_at: new Date().toISOString(),
          recipient_email: customer.email
        })
      
      // Move to the next step
      await moveToNextStep(enrollment, sequence.steps, currentStep)
    } else {
      // Handle sending failure
      console.error(`Failed to send email for enrollment ${enrollment.id}`)
    }
  } catch (error) {
    console.error(`Error processing enrollment ${enrollment.id}:`, error)
  }
}

// Move to the next step in the sequence
async function moveToNextStep(
  enrollment: EmailSequenceEnrollment, 
  steps: EmailSequenceStep[], 
  currentStep: EmailSequenceStep
) {
  // Sort steps by position
  const sortedSteps = steps.sort((a, b) => a.position - b.position)
  
  // Find index of current step
  const currentIndex = sortedSteps.findIndex(step => step.id === currentStep.id)
  
  // Check if there's a next step
  if (currentIndex < sortedSteps.length - 1) {
    const nextStep = sortedSteps[currentIndex + 1]
    
    // Calculate next send time
    const nextSendTime = calculateNextSendTime(nextStep.delayHours, nextStep.delayType)
    
    // Update enrollment with next step
    await supabase
      .from('email_sequence_enrollments')
      .update({
        current_step_id: nextStep.id,
        next_send_time: nextSendTime.toISOString()
      })
      .eq('id', enrollment.id)
    
    console.log(`Moved enrollment ${enrollment.id} to next step ${nextStep.id}, scheduled for ${nextSendTime}`)
  } else {
    // No more steps, mark sequence as completed
    await supabase
      .from('email_sequence_enrollments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        next_send_time: null
      })
      .eq('id', enrollment.id)
    
    console.log(`Completed enrollment ${enrollment.id}`)
    
    // Update analytics
    await updateSequenceAnalytics(enrollment.sequenceId)
  }
}

// Calculate the next send time based on delay settings
function calculateNextSendTime(delayHours: number, delayType: 'fixed' | 'business_days'): Date {
  const now = new Date()
  
  if (delayType === 'fixed') {
    // Simple delay in hours
    return new Date(now.getTime() + delayHours * 60 * 60 * 1000)
  } else {
    // Business days logic (skip weekends)
    let hoursAdded = 0
    let currentDate = new Date(now)
    
    while (hoursAdded < delayHours) {
      // Add one hour
      currentDate = new Date(currentDate.getTime() + 60 * 60 * 1000)
      
      // Skip non-business hours (assuming 9am-5pm business hours)
      const hour = currentDate.getHours()
      const day = currentDate.getDay()
      
      // Check if it's a weekday and business hour
      if (day >= 1 && day <= 5 && hour >= 9 && hour < 17) {
        hoursAdded++
      }
    }
    
    return currentDate
  }
}

// Evaluate condition to determine if an email should be sent
async function evaluateCondition(
  condition: { type: 'event' | 'property', value: string, operator: '=' | '!=' | '>' | '<' | '>=' | '<=' },
  customerId: string
): Promise<boolean> {
  if (condition.type === 'event') {
    // Check if event occurred
    const { data, error } = await supabase
      .from('customer_events')
      .select('*')
      .eq('customer_id', customerId)
      .eq('event_type', condition.value)
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (error) {
      console.error('Error checking event condition:', error)
      return false
    }
    
    // If event found, consider condition met
    return data && data.length > 0
  } else if (condition.type === 'property') {
    // Check customer property
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single()
    
    if (error) {
      console.error('Error fetching customer for condition check:', error)
      return false
    }
    
    // Get property value (could be nested)
    const propertyPath = condition.value.split('.')
    let value = customer
    
    for (const prop of propertyPath) {
      if (value === undefined || value === null) return false
      value = value[prop]
    }
    
    // Compare using the specified operator
    switch (condition.operator) {
      case '=': return value == condition.value
      case '!=': return value != condition.value
      case '>': return value > condition.value
      case '<': return value < condition.value
      case '>=': return value >= condition.value
      case '<=': return value <= condition.value
      default: return false
    }
  }
  
  return false
}

// Send an email using Resend
async function sendEmail(template: EmailTemplate, customer: Customer): Promise<boolean> {
  try {
    // Replace template variables with customer data
    let content = template.content
    const defaultValues = {
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      email: customer.email || '',
      // Add other common variables
    }
    
    // Replace each variable
    for (const variable of template.variables) {
      const value = defaultValues[variable.name] || variable.defaultValue
      const regex = new RegExp(`{{${variable.name}}}`, 'g')
      content = content.replace(regex, value)
    }
    
    // Send the email
    const { data, error } = await resend.emails.send({
      from: 'noreply@yourdomain.com', // Update this with your domain
      to: customer.email,
      subject: template.subject,
      html: content
    })
    
    if (error) {
      console.error('Error sending email:', error)
      return false
    }
    
    console.log('Email sent successfully:', data)
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

// Update sequence analytics after completion
async function updateSequenceAnalytics(sequenceId: string) {
  try {
    // Get all enrollments for this sequence
    const { data: enrollments, error } = await supabase
      .from('email_sequence_enrollments')
      .select('*')
      .eq('sequence_id', sequenceId)
    
    if (error) {
      console.error('Error fetching enrollments for analytics:', error)
      return
    }
    
    // Calculate analytics
    const totalEnrollments = enrollments.length
    const activeEnrollments = enrollments.filter(e => e.status === 'active').length
    const completedEnrollments = enrollments.filter(e => e.status === 'completed').length
    
    // Calculate average time to complete
    let totalCompletionTimeMs = 0
    let completedCount = 0
    
    for (const enrollment of enrollments) {
      if (enrollment.status === 'completed' && enrollment.completedAt && enrollment.startedAt) {
        const completedAt = new Date(enrollment.completedAt)
        const startedAt = new Date(enrollment.startedAt)
        totalCompletionTimeMs += completedAt.getTime() - startedAt.getTime()
        completedCount++
      }
    }
    
    const averageTimeToComplete = completedCount > 0 ? totalCompletionTimeMs / completedCount / (1000 * 60 * 60) : null // in hours
    
    // Update or insert analytics
    const { data, error: upsertError } = await supabase
      .from('email_sequence_analytics')
      .upsert({
        sequence_id: sequenceId,
        total_enrollments: totalEnrollments,
        active_enrollments: activeEnrollments,
        completed_enrollments: completedEnrollments,
        average_time_to_complete: averageTimeToComplete,
        updated_at: new Date().toISOString()
      })
    
    if (upsertError) {
      console.error('Error updating sequence analytics:', upsertError)
    }
  } catch (error) {
    console.error('Error updating sequence analytics:', error)
  }
}

// Main handler for the function
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  // Process scheduled emails when invoked
  await processScheduledEmails()
  
  // Return success response
  return new Response(
    JSON.stringify({ success: true, message: 'Email sequences processed' }),
    { 
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      } 
    }
  )
}

// When the script is invoked directly, call the handler
if (import.meta.url === Deno.mainModule) {
  await processScheduledEmails()
  console.log('Email sequence processing completed')
}

// Serve the handler for HTTP requests
Deno.serve(handler)
