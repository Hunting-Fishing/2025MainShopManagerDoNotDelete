
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Configure CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface NotificationRequestBody {
  notification_ids?: string[]
  work_order_id?: string
  notification_type?: string
  title?: string
  message?: string
  recipient_type?: string
  recipient_id?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    // Parse request body
    const body: NotificationRequestBody = await req.json()
    
    // Process notifications
    let result: any

    if (body.notification_ids && body.notification_ids.length > 0) {
      // Process specific notifications by ID
      result = await processNotificationsById(body.notification_ids)
    } else if (body.work_order_id) {
      // Create and process a new notification
      result = await createAndProcessNotification(body)
    } else {
      throw new Error('Invalid request: notification_ids or work_order_id required')
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  } catch (error) {
    console.error('Error processing notifications:', error.message)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  }
})

/**
 * Process notifications by ID
 */
async function processNotificationsById(notificationIds: string[]) {
  // Get notifications with full details
  const { data: notifications, error } = await supabase
    .from('work_order_notifications')
    .select('*')
    .in('id', notificationIds)
  
  if (error) {
    throw new Error(`Failed to fetch notifications: ${error.message}`)
  }
  
  if (!notifications?.length) {
    console.log('No notifications found to process')
    return { processed: 0 }
  }
  
  // Update notification status to processing
  await supabase
    .from('work_order_notifications')
    .update({ status: 'processing' })
    .in('id', notificationIds)
  
  const results = await Promise.all(
    notifications.map(async (notification) => {
      try {
        // Route notification based on recipient type
        if (notification.recipient_type === 'customer') {
          await sendCustomerNotification(notification)
        } else if (notification.recipient_type === 'technician') {
          await sendTechnicianNotification(notification)
        } else {
          console.log(`Unknown recipient type: ${notification.recipient_type}`)
        }
        
        // Mark as sent
        await supabase
          .from('work_order_notifications')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', notification.id)
        
        return { id: notification.id, success: true }
      } catch (error) {
        console.error(`Failed to process notification ${notification.id}:`, error)
        
        // Mark as failed
        await supabase
          .from('work_order_notifications')
          .update({ 
            status: 'failed',
            error_message: error.message
          })
          .eq('id', notification.id)
        
        return { id: notification.id, success: false, error: error.message }
      }
    })
  )
  
  return {
    processed: notifications.length,
    results
  }
}

/**
 * Create and process a new notification
 */
async function createAndProcessNotification(notification: NotificationRequestBody) {
  const { work_order_id, notification_type, title, message, recipient_type, recipient_id } = notification
  
  if (!work_order_id || !notification_type || !title || !message || !recipient_type || !recipient_id) {
    throw new Error('Missing required notification fields')
  }
  
  // Create notification
  const { data, error } = await supabase
    .from('work_order_notifications')
    .insert({
      work_order_id,
      notification_type,
      title,
      message,
      recipient_type,
      recipient_id,
      status: 'pending'
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to create notification: ${error.message}`)
  }
  
  // Process the newly created notification
  return await processNotificationsById([data.id])
}

/**
 * Send notification to customer
 */
async function sendCustomerNotification(notification: any) {
  // Get work order and customer details
  const { data: workOrder, error } = await supabase
    .from('work_orders')
    .select('*, customers(*)')
    .eq('id', notification.work_order_id)
    .single()
  
  if (error) {
    throw new Error(`Failed to fetch work order: ${error.message}`)
  }
  
  if (!workOrder) {
    throw new Error(`Work order ${notification.work_order_id} not found`)
  }
  
  const customer = workOrder.customers
  if (!customer) {
    throw new Error(`Customer not found for work order ${notification.work_order_id}`)
  }
  
  // Add to customer notification center
  // This would connect to email/push notification services in production
  console.log(`Customer notification for ${customer.email}:`, notification.message)
  
  return true
}

/**
 * Send notification to technician
 */
async function sendTechnicianNotification(notification: any) {
  // Get technician profile
  const { data: technician, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', notification.recipient_id)
    .single()
  
  if (error) {
    throw new Error(`Failed to fetch technician profile: ${error.message}`)
  }
  
  if (!technician) {
    throw new Error(`Technician ${notification.recipient_id} not found`)
  }
  
  // Add to technician notification center
  // This would connect to email/push notification services in production
  console.log(`Technician notification for ${technician.email}:`, notification.message)
  
  return true
}
