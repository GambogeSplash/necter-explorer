import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ToastProvider } from "@/components/toast";
import { OnboardingTour } from "@/components/onboarding-tour";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Necter Explorer",
  description: "Necter Network Chain Explorer — L2 blockchain for DePIN, AI, IoT, and Hardware Staking",
  icons: {
    icon: "/favicon.png",
    apple: "/brand/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geist.variable} ${geistMono.variable} ${jetbrainsMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ToastProvider>
          <Header />
          <main className="flex-1 pt-[56px]">
            <div className="animate-fadeIn">{children}</div>
          </main>
          <Footer />
          <OnboardingTour />
        </ToastProvider>
      </body>
    </html>
  );
}
