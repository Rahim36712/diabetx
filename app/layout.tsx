import type { Metadata } from "next";
import "./globals.css";
import { NavProvider } from "@/context/NavContext";
import ShaderBackground from "@/components/ShaderBackground";
import SideNavBar from "@/components/SideNavBar";
import TopNavBar from "@/components/TopNavBar";
import BottomNavBar from "@/components/BottomNavBar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "DiabetX — Your Digital Twin",
  description:
    "A lightweight digital twin for diabetes self-management: log your numbers, see a live health score, run what-if simulations, and ask an AI coach grounded in your own data.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0A0E1A] text-[#dee2f6] min-h-screen antialiased font-sans selection:bg-cyan-500/30 relative">
        <NavProvider>
          <ShaderBackground />
          <TopNavBar />
          <SideNavBar />
          <div className="pt-16 pb-20 md:py-0 min-h-screen flex flex-col justify-between">
            {children}
            <Footer />
          </div>
          <BottomNavBar />
        </NavProvider>
      </body>
    </html>
  );
}

