import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Kavya Boss Nutrition | Premium Supplements in Agra",
    template: "%s | Kavya Boss Nutrition"
  },
  description: "Agra's trusted nutrition wholesaler since 2019. Premium whey protein, mass gainers, weight gain supplements & health products. Located at Kheria Mode, Agra.",
  keywords: ["supplements", "whey protein", "weight gain", "mass gainer", "nutrition store agra", "kavya boss nutrition", "health supplements", "protein powder"],
  authors: [{ name: "Kavya Boss Nutrition" }],
  creator: "Kavya Boss Nutrition",
  publisher: "Kavya Boss Nutrition",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://kavyabossnutrition.com",
    siteName: "Kavya Boss Nutrition",
    title: "Kavya Boss Nutrition | Premium Supplements in Agra",
    description: "Agra's trusted nutrition wholesaler since 2019. Premium whey protein, mass gainers, weight gain supplements & health products.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Kavya Boss Nutrition",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kavya Boss Nutrition | Premium Supplements in Agra",
    description: "Agra's trusted nutrition wholesaler since 2019.",
    creator: "@kavyabossnutrition",
    images: ["/twitter-image.jpg"],
  },
  metadataBase: new URL("https://kavyabossnutrition.com"),
};

import ScrollToTop from "@/components/ScrollToTop";
import NextTopLoader from "nextjs-toploader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full" suppressHydrationWarning>
        <body className={`${outfit.className} min-h-full antialiased`}>
          <NextTopLoader 
            color="#00FF87" 
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #00FF87,0 0 5px #00FF87"
          />
          <ScrollToTop />
          {children}
          <Toaster position="top-right" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
