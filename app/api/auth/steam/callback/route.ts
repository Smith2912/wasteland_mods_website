import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

// Steam API configuration
const STEAM_API_KEY = process.env.STEAM_API_KEY;

export async function GET(request: NextRequest) {
  try {
    // Get parameters from the URL
    const searchParams = request.nextUrl.searchParams;
    const claimedId = searchParams.get('openid.claimed_id');
    
    if (!claimedId) {
      console.error("❌ No claimed_id in Steam response");
      return NextResponse.redirect(new URL('/account?error=steam_auth_failed', request.url));
    }
    
    // Extract Steam ID from claimed_id
    const steamId = claimedId.split('/').pop();
    
    if (!steamId) {
      console.error("❌ Failed to extract Steam ID from", claimedId);
      return NextResponse.redirect(new URL('/account?error=invalid_steam_id', request.url));
    }
    
    console.log("✅ Steam ID extracted:", steamId);
    
    // Validate Steam API key
    if (!STEAM_API_KEY) {
      console.error("❌ Missing STEAM_API_KEY environment variable");
      return NextResponse.redirect(new URL('/account?error=steam_api_configuration', request.url));
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
        return NextResponse.redirect(new URL('/account?error=steam_profile_not_found', request.url));
      }
      
      const steamProfile = data.response.players[0];
      console.log("✅ Successfully retrieved Steam profile for:", steamProfile.personaname);
    
      // Get the current Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("❌ Error getting Supabase session:", sessionError);
        return NextResponse.redirect(new URL('/account?error=auth_session_error', request.url));
      }
      
      if (!session?.user) {
        console.log("⚠️ No authenticated user found to link Steam account");
        // If no user is logged in, redirect to login and save the Steam ID in query param
        // This can be handled later to complete the linking process after login
        return NextResponse.redirect(
          new URL(`/account?steamPending=${steamId}&steamUsername=${encodeURIComponent(steamProfile.personaname || '')}`, 
          request.url)
        );
      }
      
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
        return NextResponse.redirect(new URL('/account?error=steam_link_failed', request.url));
      }
      
      console.log("✅ Successfully linked Steam account for user", session.user.id);
      
      // Redirect back to account page with success message
      return NextResponse.redirect(new URL('/account?steam=linked', request.url));
    } catch (steamApiError) {
      console.error("❌ Steam API error:", steamApiError);
      return NextResponse.redirect(new URL('/account?error=steam_api_error', request.url));
    }
  } catch (error) {
    console.error("❌ Error linking Steam account:", error);
    return NextResponse.redirect(new URL('/account?error=steam_link_failed', request.url));
  }
} 