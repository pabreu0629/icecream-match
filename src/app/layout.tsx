import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Icecream Match", description: "Team-building flavor picker" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
