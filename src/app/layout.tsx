import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "TaxIQ",
  description: "Finance, Tax & Accounting news and announcements",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={montserrat.variable} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
