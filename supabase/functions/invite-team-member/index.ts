import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InviteRequest {
  email: string;
  firstName: string;
  lastName: string;
  profileId: string;
  roleId: string;
  shopId: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the service role key from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured');
    }

    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { email, firstName, lastName, profileId, roleId, shopId } = await req.json() as InviteRequest;

    console.log('Inviting team member:', { email, firstName, lastName, profileId });

    // Send invitation email using Admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        first_name: firstName,
        last_name: lastName,
        profile_id: profileId,
        role_id: roleId,
        shop_id: shopId
      },
      redirectTo: `${req.headers.get('origin')}/auth/callback`
    });

    if (authError) {
      console.error('Error inviting user:', authError);
      throw authError;
    }

    console.log('Invitation sent successfully:', authData);

    // Update profile with invitation sent timestamp
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        invitation_sent_at: new Date().toISOString() 
      })
      .eq('id', profileId);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      // Don't throw - invitation was sent successfully
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invitation sent successfully',
        userId: authData.user?.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in invite-team-member function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to send invitation'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});
