import type { Metadata } from "next";
import "./globals.css";

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
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
