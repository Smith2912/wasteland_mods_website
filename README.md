# Wasteland Mods Website

A Next.js 15 application for selling and managing DayZ mods.

## Features

- User authentication via Supabase (Discord and Steam)
- Mod browsing and purchasing
- User account management
- Steam account linking for mod access
- PayPal payment integration
- Shopping cart functionality
- Image watermarking system
- Responsive design
- Secure mod file delivery via Supabase Storage

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
# Supabase Authentication
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# PayPal Integration
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id

# Steam Authentication
STEAM_API_KEY=your-steam-api-key
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
- `/app/context`: React context providers
- `/app/lib`: Utility functions and shared code
- `/public`: Static assets
- `/scripts`: Utility scripts for administration
- `/supabase`: SQL files and Supabase configuration

## Key Components

### Authentication

The application uses Supabase for authentication with Discord and Steam integration:

1. Users sign in with Discord OAuth
2. Steam authentication is linked via the Supabase system
3. User sessions are managed through Supabase Authentication API

### Image Watermarking

The site implements a custom watermarking system for image protection:

- `WatermarkedImage` component wraps Next.js Image component
- Configurable watermark positioning, opacity, and size
- Applied consistently across mod images
- See `README-watermark.md` for detailed implementation

### Checkout Process

Payment processing uses PayPal integration:

1. Users add mods to cart through the Cart context
2. Checkout is processed via PayPal JS SDK
3. Purchase records are saved in the database
4. Users can access purchased mods in their account

### Mod File Delivery

Secure mod file delivery is implemented using Supabase Storage:

1. Mod files are stored in a private Supabase Storage bucket
2. Access is restricted by Row Level Security (RLS) policies
3. Files are organized by mod ID in the bucket
4. Download links use temporary signed URLs that expire after 5 minutes
5. See `supabase/README-mod-delivery.md` for detailed implementation

#### Uploading Mod Files

The repository includes a utility script for uploading mod files:

```bash
# Usage
npm run upload-mod <modId> <filePath> [version]

# Example
npm run upload-mod vehicle-protection ./mods/vehicle-protection.zip 1.0.2
```

## Important Notes

- The application requires Suspense boundaries around components that use `useSearchParams()` hook
- Image watermarking is implemented on both Next.js Image components and native img elements
- ESLint and TypeScript type checking are disabled during production builds in `next.config.ts`
- The service role key is required for generating secure download links and should be kept private
