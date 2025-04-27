import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Steam API configuration
const STEAM_API_KEY = process.env.STEAM_API_KEY;

export async function GET(request: NextRequest) {
  try {
    // Get parameters from the URL
    const searchParams = request.nextUrl.searchParams;
    const claimedId = searchParams.get('openid.claimed_id');
    // Get the callback URL if provided
    const callbackUrl = searchParams.get('callbackUrl') || '/account';
    
    if (!claimedId) {
      console.error("❌ No claimed_id in Steam response");
      return NextResponse.redirect(new URL(`/account?error=steam_auth_failed&callbackUrl=${encodeURIComponent(callbackUrl)}`, request.url));
    }
    
    // Extract Steam ID from claimed_id
    const steamId = claimedId.split('/').pop();
    
    if (!steamId) {
      console.error("❌ Failed to extract Steam ID from", claimedId);
      return NextResponse.redirect(new URL(`/account?error=invalid_steam_id&callbackUrl=${encodeURIComponent(callbackUrl)}`, request.url));
    }
    
    console.log("✅ Steam ID extracted:", steamId);
    
    // Validate Steam API key
    if (!STEAM_API_KEY) {
      console.error("❌ Missing STEAM_API_KEY environment variable");
      return NextResponse.redirect(new URL(`/account?error=steam_api_configuration&callbackUrl=${encodeURIComponent(callbackUrl)}`, request.url));
    }
    
    // Fetch user profile from Steam API
    try {
      const apiUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Steam API returned status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.response || !data.response.players || !data.response.players.length) {
        console.error("❌ Steam API returned no player data");
        return NextResponse.redirect(new URL(`/account?error=steam_profile_not_found&callbackUrl=${encodeURIComponent(callbackUrl)}`, request.url));
      }
      
      const steamProfile = data.response.players[0];
      console.log("✅ Successfully retrieved Steam profile for:", steamProfile.personaname);
    
      // Create a Supabase client for this route handler
      const supabase = createRouteHandlerClient({ cookies });
      
      // Get the current Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("❌ Error getting Supabase session:", sessionError);
        return NextResponse.redirect(new URL(`/account?error=auth_session_error&callbackUrl=${encodeURIComponent(callbackUrl)}`, request.url));
      }
      
      let userId;
      
      // Check if the user is authenticated - if not, we'll create a new account with Steam
      if (!session?.user) {
        console.log("ℹ️ No authenticated user found - creating account with Steam");
        
        // Attempt to sign in or create an account with Steam credentials
        const { data: authData, error: authError } = await supabase.auth.signInWithIdToken({
          provider: 'steam',
          token: steamId, // Steam doesn't use a token in the traditional sense
          nonce: steamProfile.personaname, // Use personaname as a nonce (for custom implementation)
        });
        
        if (authError) {
          console.error("❌ Error creating Steam user:", authError);
          
          // If we can't sign in with IdToken (custom provider might not be set up),
          // try creating a user through a custom flow for Steam
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: `steam_${steamId}@steamcommunity.id`,
            password: crypto.randomUUID(), // Generate a random password
            options: {
              data: {
                steamId: steamId,
                steamUsername: steamProfile.personaname,
                steamAvatar: steamProfile.avatarfull,
                provider: 'steam',
                steamProfileUpdatedAt: new Date().toISOString()
              }
            }
          });
          
          if (signUpError) {
            console.error("❌ Error creating Steam user account:", signUpError);
            return NextResponse.redirect(new URL(`/account?error=steam_auth_failed`, request.url));
          }
          
          userId = signUpData.user?.id;
          console.log("✅ Created new account with Steam identity, user ID:", userId);
        } else {
          userId = authData.user?.id;
          console.log("✅ Signed in with Steam identity, user ID:", userId);
        }
        
        // Get the updated session after sign-in or sign-up
        const { data: { session: updatedSession } } = await supabase.auth.getSession();
        
        if (updatedSession) {
          console.log("✅ Session created successfully after Steam auth");
          
          // Redirect to the callback URL with success message
          const res = NextResponse.redirect(new URL(callbackUrl, request.url));
          res.headers.set('X-Auth-Debug', 'Steam session created');
          
          return res;
        } else {
          console.error("❌ No session after Steam authentication");
          return NextResponse.redirect(new URL(`/account?error=steam_session_error`, request.url));
        }
      } 
      
      // If we have a session, link the Steam account to the existing user
      userId = session.user.id;
      
      // Update user metadata to include Steam ID
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        data: { 
          steamId: steamId,
          steamUsername: steamProfile.personaname,
          steamAvatar: steamProfile.avatarfull,
          steamProfileUpdatedAt: new Date().toISOString()
        }
      });
      
      if (updateError) {
        console.error("❌ Error updating user data:", updateError);
        return NextResponse.redirect(new URL(`/account?error=steam_link_failed&callbackUrl=${encodeURIComponent(callbackUrl)}`, request.url));
      }
      
      console.log("✅ Successfully linked Steam account for user", session.user.id);
      
      // Redirect back to the original callbackUrl or account page with success message
      // Check if callbackUrl is different from the default account page
      if (callbackUrl && callbackUrl !== '/account') {
        return NextResponse.redirect(new URL(callbackUrl, request.url));
      } else {
        const res = NextResponse.redirect(new URL('/account?steam=linked', request.url));
        res.headers.set('X-Auth-Debug', 'Steam linked to existing account');
        return res;
      }
    } catch (steamApiError) {
      console.error("❌ Steam API error:", steamApiError);
      return NextResponse.redirect(new URL(`/account?error=steam_api_error&callbackUrl=${encodeURIComponent(callbackUrl)}`, request.url));
    }
  } catch (error) {
    console.error("❌ Error linking Steam account:", error);
    return NextResponse.redirect(new URL('/account?error=steam_link_failed', request.url));
  }
} 