import NextAuth, { AuthOptions } from "next-auth";
import Discord from "next-auth/providers/discord";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "../../../generated/prisma";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

// Extend the built-in types
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      discordProfile?: any;
      steamProfile?: any;
      steamLinked?: boolean;
    }
  }
  
  interface User {
    steamId?: string;
    steamProfile?: any;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    discordProfile?: any;
    steamId?: string;
    steamProfile?: any;
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
          token.discordProfile = profile;
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