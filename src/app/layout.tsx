import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/components/ui/Toaster";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const fraunces = Fraunces({ subsets: ["latin"], display: "swap", variable: "--font-display", weight: ["600", "700"] });

export const metadata: Metadata = {
  title: "Policy Bootcamp Job Portal",
  description: "Exclusive job board for Policy Bootcamp delegates & alumni — Rastram School of Public Leadership, Rishihood University.",
  applicationName: "Policy Bootcamp Jobs",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "PB Jobs" },
};

export const viewport: Viewport = {
  themeColor: "#0f1f3a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-sans">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
