import type { Metadata } from "next";
import "./globals.css";

// Define metadata for the application
export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
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
        {/* Render the children (page content) */}
        {children}
      </body>
    </html>
  );
}
