import NextAuth from "next-auth";
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
  }
}

// Define the auth handler function
const handler = NextAuth({
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
    // SteamProvider({
    //   clientSecret: process.env.STEAM_API_KEY as string,
    //   callbackUrl: `${process.env.NEXTAUTH_URL}/api/auth/callback/steam`,
    // }),
  ],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      // Save the user ID to the token right after signin
      if (user?.id && !token.userId) {
        token.userId = user.id;
      }
      
      // Handle Discord login
      if (account?.provider === 'discord') {
        token.accessToken = account.access_token;
        if (profile) {
          token.discordProfile = profile;
        }
      }
      
      // // Handle Steam login or linking
      // if (account?.provider === 'steam') {
      //   token.steamId = account.providerAccountId;
      //   token.steamProfile = profile;
      //   
      //   // If user is already logged in with Discord, link the Steam account
      //   if (token.userId) {
      //     try {
      //       await prisma.user.update({
      //         where: { id: token.userId },
      //         data: { steamId: account.providerAccountId }
      //       });
      //     } catch (error) {
      //       console.error("Error linking Steam account:", error);
      //     }
      //   }
      // }
      
      return token;
    },
    async session({ session, token, user }) {
      // Send the Discord access token and profile to the client
      if (token) {
        session.accessToken = token.accessToken;
        
        if (token.discordProfile) {
          session.user.discordProfile = token.discordProfile;
        }
        
        // Add the user ID to the session
        if (token.userId) {
          session.user.id = token.userId;
        }
        
        // TEMPORARY: Always set steamLinked to true for testing
        // Remove this once Steam integration is working
        session.user.steamLinked = true;
        
        // // Check if user has a Steam account linked
        // if (token.userId) {
        //   try {
        //     const userWithSteam = await prisma.user.findUnique({
        //       where: { id: token.userId as string },
        //       select: { steamId: true }
        //     });
        //     
        //     session.user.steamLinked = !!userWithSteam?.steamId;
        //     
        //     // If Steam is linked, add the Steam profile to the session
        //     if (token.steamProfile && userWithSteam?.steamId) {
        //       session.user.steamProfile = token.steamProfile;
        //     }
        //   } catch (error) {
        //     console.error("Error checking Steam link:", error);
        //     session.user.steamLinked = false;
        //   }
        // } else {
        //   // Default to false if no userId
        //   session.user.steamLinked = false;
        // }
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST }; 