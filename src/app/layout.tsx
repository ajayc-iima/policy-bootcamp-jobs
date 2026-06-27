import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Newsreader } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/components/ui/Toaster";

const hanken = Hanken_Grotesk({ 
  subsets: ["latin"], 
  display: "swap", 
  variable: "--font-hanken",
  fallback: ["system-ui", "sans-serif"],
});
const newsreader = Newsreader({ 
  subsets: ["latin"], 
  display: "swap", 
  variable: "--font-newsreader", 
  weight: ["400", "500", "600", "700"], 
  style: ["normal", "italic"],
  fallback: ["system-ui", "serif"],
});

export const metadata: Metadata = {
  title: "Policy BootCamp Job Portal",
  description: "Exclusive job board for Policy BootCamp delegates & alumni — Rashtram School of Public Leadership, Rishihood University.",
  applicationName: "Policy BootCamp Jobs",
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
    <html lang="en" className={`${hanken.variable} ${newsreader.variable}`}>
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
