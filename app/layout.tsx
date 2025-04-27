import './globals.css';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from './providers';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ClientInitializer from './components/ClientInitializer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Wasteland Mods - Premium DayZ Mods',
  description: 'High-quality DayZ mods for server owners looking to enhance their player experience',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-white min-h-screen flex flex-col`}
      >
        <Providers>
          <Navigation />
          <main className="flex-grow">{children}</main>
          <Footer />
          <ClientInitializer />
        </Providers>
      </body>
    </html>
  );
}
