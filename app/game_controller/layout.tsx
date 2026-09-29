import type { Viewport } from "next";

// stop pinch/double-tap zoom on the controller and let it draw under the phone's notch
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function GameControllerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
