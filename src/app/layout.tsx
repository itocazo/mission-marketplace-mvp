import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import ClientProvider from "@/components/layout/ClientProvider";
import ToastContainer from "@/components/ui/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mission Marketplace",
  description: "Internal mission-based marketplace for organizational coordination",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#f8f9fb]" suppressHydrationWarning>
        <ClientProvider>
          <Header />
          <main className="flex-1">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
              {children}
            </div>
          </main>
          <ToastContainer />
        </ClientProvider>
      </body>
    </html>
  );
}
