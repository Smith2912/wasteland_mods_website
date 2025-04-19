import NextAuth, { AuthOptions } from "next-auth";
import Discord from "next-auth/providers/discord";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../lib/prisma";

// Define a custom Profile type for better type safety
interface DiscordProfile {
  id: string;
  username: string;
  avatar: string;
  discriminator: string;
  email: string;
  verified: boolean;
  [key: string]: unknown;
}

interface SteamProfile {
  steamid: string;
  personaname?: string;
  avatarfull?: string;
  [key: string]: unknown;
}

// Extend the built-in types
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      discordProfile?: DiscordProfile;
      steamProfile?: SteamProfile;
      steamLinked?: boolean;
    }
  }
  
  interface User {
    steamId?: string;
    steamProfile?: SteamProfile;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    discordProfile?: DiscordProfile;
    steamId?: string;
    steamProfile?: SteamProfile;
    userId?: string;
    sub?: string;
  }
}

// Define the auth handler function and export configuration
export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: "identify email guilds"
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      // Save the user ID to the token right after signin
      if (user?.id) {
        token.userId = user.id;
        token.sub = user.id;
      }
      
      // Handle Discord login
      if (account?.provider === 'discord') {
        token.accessToken = account.access_token;
        if (profile) {
          token.discordProfile = profile as DiscordProfile;
        }
      }
      
      console.log('JWT token:', token);
      return token;
    },
    async session({ session, token }) {
      // Send the Discord access token and profile to the client
      if (token) {
        session.accessToken = token.accessToken;
        
        if (token.discordProfile) {
          session.user.discordProfile = token.discordProfile;
        }
        
        // Add the user ID to the session - use all possible sources
        if (token.userId) {
          session.user.id = token.userId;
        } else if (token.sub) {
          session.user.id = token.sub;
        }
        
        console.log('Session data:', JSON.stringify(session, null, 2));
        
        // For now, always return steamLinked as true to disable redirects
        // This will be replaced with actual Steam linking functionality
        session.user.steamLinked = true;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 