import type { Metadata } from 'next';
import './globals.css';
import { CameraCursor } from '../components/CameraCursor';

export const metadata: Metadata = {
  title: 'GenCraft — AI Creator Marketplace & Studio',
  description: 'Connect with specialized Generative AI creators. High-fidelity cinematic commercials, photorealistic product assets, character animation, and verified AI pipelines.',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'GenCraft — AI Creator Marketplace & Studio',
    description: 'Connect with specialized Generative AI creators. High-fidelity cinematic commercials, photorealistic product assets, character animation, and verified AI pipelines.',
    siteName: 'GenCraft',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GenCraft — AI Creator Marketplace & Studio',
    description: 'Connect with specialized Generative AI creators. High-fidelity cinematic commercials, photorealistic product assets, character animation, and verified AI pipelines.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen bg-zinc-950 text-zinc-100 selection:bg-white selection:text-zinc-950">
        <CameraCursor />
        {children}
      </body>
    </html>
  );
}
