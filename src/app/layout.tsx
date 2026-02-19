import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { Header } from "@/components/layout/header";
import "./globals.css";

export const bricolageGrotesque = Bricolage_Grotesque({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
});

export const inter = Inter({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MDS Alumni",
  description: "Annuaire alumni My Digital School",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${bricolageGrotesque.variable} ${inter.variable} font-sans antialiased`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
