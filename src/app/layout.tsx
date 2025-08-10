import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";
import { TrophyProvider } from "./contexts/TrophyContext";
import TrophyNotifications from "./components/TrophyNotification";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Job Tracker",
  description: "Track your job applications with a PS5-inspired trophy system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <TrophyProvider>
          <Navigation />
          <TrophyNotifications />
          {children}
        </TrophyProvider>
      </body>
    </html>
  );
}