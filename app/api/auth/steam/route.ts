import { NextRequest, NextResponse } from 'next/server';
import querystring from 'querystring';

// Steam OpenID configuration
const STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login';
const APP_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  // Get the callbackUrl parameter if it exists
  const requestUrl = new URL(request.url);
  const callbackUrl = requestUrl.searchParams.get('callbackUrl') || '/account';
  
  // Construct the callback URL with the original callbackUrl as a parameter
  const returnToUrl = new URL(`${APP_URL}/api/auth/steam/callback`, request.url);
  returnToUrl.searchParams.set('callbackUrl', callbackUrl);
  
  // Steam OpenID parameters
  const params = {
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': returnToUrl.toString(),
    'openid.realm': APP_URL,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select'
  };

  // Redirect to Steam OpenID endpoint
  const steamLoginUrl = `${STEAM_OPENID_URL}?${querystring.stringify(params)}`;
  console.log('Redirecting to Steam login with return URL:', returnToUrl.toString());
  return NextResponse.redirect(steamLoginUrl);
} 