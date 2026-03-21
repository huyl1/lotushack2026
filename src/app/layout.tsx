import type { Metadata } from "next";
import { Geist, Geist_Mono, Syne } from "next/font/google";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Edify",
  description: "Edify",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} h-full antialiased`}
    >
      <body className="grain min-h-full flex flex-col">
        <Theme
          accentColor="ruby"
          grayColor="sand"
          radius="medium"
          panelBackground="translucent"
        >
          {children}
        </Theme>
      </body>
    </html>
  );
}
