import { NextRequest, NextResponse } from 'next/server';

// Steam OpenID configuration
const STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login';
const STEAM_API_KEY = process.env.STEAM_API_KEY;

export async function GET(request: NextRequest) {
  try {
    // Get the current domain for the return URL
    const domain = request.headers.get('host') || 'localhost:3000';
    const protocol = domain.includes('localhost') ? 'http' : 'https';
    const returnUrl = `${protocol}://${domain}/api/auth/steam/callback`;

    // Build the Steam OpenID parameters
    const params = new URLSearchParams({
      'openid.ns': 'http://specs.openid.net/auth/2.0',
      'openid.mode': 'checkid_setup',
      'openid.return_to': returnUrl,
      'openid.realm': `${protocol}://${domain}`,
      'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
      'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select'
    });

    // Redirect to Steam's OpenID endpoint
    const steamLoginUrl = `${STEAM_OPENID_URL}?${params.toString()}`;
    return NextResponse.redirect(steamLoginUrl);
  } catch (error) {
    console.error('Error initiating Steam login:', error);
    return NextResponse.redirect(new URL('/auth/error', request.url));
  }
} 