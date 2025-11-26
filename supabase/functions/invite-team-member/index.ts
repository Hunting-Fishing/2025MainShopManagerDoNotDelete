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

    // Check if profile already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, user_id')
      .eq('id', profileId)
      .single();

    if (!existingProfile) {
      throw new Error('Profile not found');
    }

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

    // Link the auth user to the existing profile
    if (authData.user?.id) {
      const { error: linkError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          user_id: authData.user.id,
          has_auth_account: true,
          invitation_sent_at: new Date().toISOString() 
        })
        .eq('id', profileId);

      if (linkError) {
        console.error('Error linking profile to auth user:', linkError);
      }
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
