"use server";

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '../../generated/prisma';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get parameters from the URL
    const searchParams = request.nextUrl.searchParams;
    const claimedId = searchParams.get('openid.claimed_id');
    
    // Debug the session
    const session = await getServerSession(authOptions);
    console.log("Steam route session:", JSON.stringify(session, null, 2));
    
    if (!claimedId) {
      console.error("No claimed_id in Steam response");
      return NextResponse.redirect(new URL('/account?error=steam_auth_failed', request.url));
    }
    
    // Extract Steam ID from claimed_id
    const steamId = claimedId.split('/').pop();
    
    if (!steamId) {
      console.error("Failed to extract Steam ID from", claimedId);
      return NextResponse.redirect(new URL('/account?error=invalid_steam_id', request.url));
    }
    
    console.log("Steam ID extracted:", steamId);
    
    // Fetch user profile from Steam API
    const apiUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamId}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    const steamProfile = data.response.players[0];
    
    if (!steamProfile) {
      console.error("Failed to fetch Steam profile");
      return NextResponse.redirect(new URL('/account?error=steam_profile_fetch_failed', request.url));
    }
    
    // Find the user ID using either session data or email lookup
    let userId = null;
    
    // First try to get the user ID from the session
    if (session?.user?.id) {
      userId = session.user.id;
    } 
    // If we don't have a user ID but we have an email, look up the user by email
    else if (session?.user?.email) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true }
        });
        
        if (user) {
          userId = user.id;
          console.log("Found user ID via email lookup:", userId);
        }
      } catch (error) {
        console.error("Error looking up user by email:", error);
      }
    }
    
    // If we still don't have a user ID, redirect to sign in
    if (!userId) {
      console.error("No valid user ID found even after email lookup");
      return NextResponse.redirect(new URL('/auth/signin?callbackUrl=/account&steam_pending=true', request.url));
    }
    
    // Update user in database
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { steamId: steamId }
      });
      
      console.log("Successfully linked Steam account for user", userId);
      
      // Redirect back to account page with success message
      return NextResponse.redirect(new URL('/account?steam=linked', request.url));
    } catch (error) {
      console.error("Database error linking Steam account:", error);
      return NextResponse.redirect(new URL('/account?error=steam_link_failed', request.url));
    }
  } catch (error) {
    console.error("Error linking Steam account:", error);
    return NextResponse.redirect(new URL('/account?error=steam_link_failed', request.url));
  }
} 