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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('gencraft_theme') || localStorage.getItem('createai_theme');
                  if (saved === 'light') {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-zinc-950 text-zinc-100 selection:bg-white selection:text-zinc-950">
        <CameraCursor />
        {children}
      </body>
    </html>
  );
}
