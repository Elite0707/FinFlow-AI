import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import Script from "next/script";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Intelligent Document Extraction Platform",
  description: "Transform messy PDFs into clean, structured Excel outputs.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={bricolage.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
