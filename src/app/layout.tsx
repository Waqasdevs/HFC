import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#010102',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://hfc-orders.vercel.app'),
  title: 'HFC OS — Offline-First Restaurant Order Management System for Pakistan',
  description:
    'Built inside a real Pakistani restaurant kitchen. Run 80mm thermal KOT printing, live Kitchen Display Screens, table floor plans, and zero-commission direct delivery even when PTCL fiber drops.',
  keywords: [
    'restaurant POS Pakistan',
    'offline POS Lahore Karachi Islamabad',
    '80mm thermal KOT printer software',
    'kitchen display system Pakistan',
    'zero commission delivery restaurant system',
    'FBR PRA SRB restaurant billing software',
  ],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'HFC OS — Offline-First Restaurant OS for Pakistan',
    description:
      'Zero cloud lag during Friday rush. 80mm thermal KOT slips, touch KDS, and 0% commission direct delivery built for Pakistani restaurants.',
    url: 'https://hfc-orders.vercel.app',
    siteName: 'HFC OS Pakistan',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HFC OS — Offline-First Restaurant Order Management System for Pakistan',
      },
    ],
    locale: 'en_PK',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HFC OS — Offline-First Restaurant OS for Pakistan',
    description:
      '80mm thermal KOT printing, touch KDS, and zero-commission delivery management built for Pakistani kitchens.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600&family=Geist:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased selection:bg-[#AD96F1] selection:text-[#010102]">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(err => {
                    console.log('SW registration error:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
