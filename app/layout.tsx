import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_NAME = "Mama Chidi's Kitchen";
const DESCRIPTION =
  "Order jollof rice, grilled chicken, burgers, pizza and more from Mama Chidi's Kitchen. Fast delivery across Lagos.";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — Delicious Food, Delivered`,
    template: `%s · ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  category: "food",
  keywords: [
    "Nigerian food delivery",
    "jollof rice",
    "grilled chicken",
    "burger",
    "pizza",
    "Lagos restaurant",
    "order food online",
  ],
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Delicious Food, Delivered`,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} — Delicious Food, Delivered`,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#fffaf4",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream-50 text-charcoal-900">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
