import type { Metadata } from "next";
import "./globals.css";

// Define metadata for the application
export const metadata: Metadata = {
  title: "TowerTech",
  description: "a multiplayer tower defense game",
};

// RootLayout component
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">    
      <body>
          {children}
      </body>
    </html>
  );
}
