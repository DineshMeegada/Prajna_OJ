import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import Navbar from "@/components/ui/Navbar";
import "./globals.css";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Prajna OJ",
  description:
    "Dark, coder-friendly interface to explore problems and practise algorithms.",
  icons: {
    icon: "/favicon.ico",
  },
};


const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!clientId && process.env.NODE_ENV === 'development') {
    console.error('Google Client ID is missing! Check the .env file');
  }

  return (
    <html lang="en">
      <body
        className={`${grotesk.variable} ${jetbrains.variable} bg-base text-muted antialiased`}
      >
        <GoogleOAuthProvider clientId={clientId || ""}>
          <AuthProvider>
            <div className="relative min-h-screen overflow-hidden bg-grid before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(circle_at_top,_rgba(0,255,204,0.15),transparent_55%)]">
              <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-44 bg-gradient-to-b from-accent/10 to-transparent blur-3xl" />
              <Navbar />
              <div className="pt-16">
                {children}
              </div>
            </div>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
