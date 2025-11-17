import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "next-themes"
import { Inter } from 'next/font/google'
import { Toaster } from "sonner"

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://rembg.io'),
  title: "Remove Background from Image for Free – RemBG.io",
  description: "Remove background from images instantly with AI. 100% automatic, free, and works offline in your browser. No uploads, no registration required. Perfect for product photos, portraits, and marketing materials.",
  icons: {
    icon: '/rembg_photo_2025-11-17_13-29-10_2025-11-17_07-59-47_isnet.png',
    shortcut: '/rembg_photo_2025-11-17_13-29-10_2025-11-17_07-59-47_isnet.png',
    apple: '/rembg_photo_2025-11-17_13-29-10_2025-11-17_07-59-47_isnet.png',
  },
  keywords: [
    "remove background", 
    "remove bg", 
    "background removal", 
    "free background remover",
    "AI background removal", 
    "image editor", 
    "offline image processing",
    "product photography",
    "transparent background",
    "cutout images",
    "photo editing",
    "marketing materials",
    "e-commerce photos"
  ],
  authors: [{ name: "RemBG.io" }],
  creator: "RemBG.io",
  publisher: "RemBG.io",
  robots: "index, follow",
  openGraph: {
    title: "Remove Background from Image for Free – RemBG.io",
    description: "Remove background from images instantly with AI. 100% automatic, free, and works offline in your browser.",
    type: "website",
    locale: "en_US",
    url: "https://rembg.io",
    siteName: "RemBG.io",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "RemBG.io - Free AI Background Removal Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Remove Background from Image for Free – RemBG.io",
    description: "Remove background from images instantly with AI. 100% automatic, free, and works offline in your browser.",
    images: ["/og-image.jpg"],
  },
  verification: {
    google: "your-google-verification-code",
  },
  alternates: {
    canonical: "https://rembg.io",
  },
  category: "Technology",
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "RemBG.io",
  "description": "Free AI-powered background removal tool that works offline in your browser",
  "url": "https://rembg.io",
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "creator": {
    "@type": "Organization",
    "name": "RemBG.io"
  },
  "featureList": [
    "Remove background from images",
    "AI-powered processing",
    "Works offline",
    "No uploads required",
    "Free to use",
    "Multiple output formats"
  ],
  "screenshot": "https://rembg.io/screenshot.jpg"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning={true} className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="top-center" richColors />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}