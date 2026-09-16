import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lions Leads",
  description: "Encontre e organize oportunidades locais com dados abertos do OpenStreetMap.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
