# Wasteland Mods Website

A Next.js 15 application for selling and managing DayZ mods.

## Features

- User authentication via Discord and Steam
- Mod browsing and purchasing
- User account management
- Steam account linking for mod access

## Development

### Prerequisites

- Node.js 18.17 or later
- npm 9.6.7 or later

### Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# Next Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Discord OAuth
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret

# Steam Authentication
STEAM_API_KEY=your-steam-api-key

# Database
DATABASE_URL=your-database-url
```

## Building for Production

```bash
# Generate production build
npm run build

# Start production server
npm start
```

## Code Structure

- `/app`: Next.js App Router pages and components
- `/app/api`: API routes (Next.js Route Handlers)
- `/app/components`: Reusable UI components
- `/app/generated`: Generated Prisma client
- `/public`: Static assets

## Authentication Flow

This application uses NextAuth.js for authentication with Discord and a custom OpenID flow for Steam authentication:

1. Users sign in with Discord OAuth
2. Steam authentication is handled via OpenID and a custom API route
3. Both accounts are linked in the database

## Important Notes

- The application requires Suspense boundaries around components that use `useSearchParams()` hook from Next.js
- ESLint and TypeScript type checking are disabled during production builds in `next.config.ts`
