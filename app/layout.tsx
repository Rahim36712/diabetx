import type { Metadata } from "next";
import "./globals.css";
import { NavProvider } from "@/context/NavContext";

export const metadata: Metadata = {
  title: "DiabetX — Digital Twin OS",
  description: "An educational digital twin for diabetes self-management.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavProvider>{children}</NavProvider>
      </body>
    </html>
  );
}
