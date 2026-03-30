import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"], display: 'swap' });

export const metadata: Metadata = {
  title: "Multi-Model Inference Optimizer",
  description: "Intelligent routing across Hugging Face models for optimal LLM responses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} h-screen flex flex-col bg-[#0f0f0f] text-gray-100 overflow-hidden`}>
        <AuthProvider>
          {/* Background gradient - fixed */}
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0f0f0f] to-[#0f0f0f] -z-50 pointer-events-none" />
          
          {/* Header - fixed height */}
          <Header />
          
          {/* Main content - flex container, no scroll */}
          <main className="flex-1 flex flex-col overflow-hidden relative z-10">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
