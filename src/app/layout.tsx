import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Mon facilitateur | Accélérez l'innovation collective",
  description:
    "Rendez chaque réunion plus courte et plus productive. Copilote de facilitation pour sessions solo, équipe et grands ateliers.",
  openGraph: {
    title: "Mon facilitateur",
    description: "Accélérez l'innovation collective et structurez vos sessions de facilitation.",
    images: ["/logo.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Mon facilitateur",
      url: "https://monfacilitateur.app",
      logo: "https://monfacilitateur.app/logo.png",
      description: "Plateforme de facilitation pour accélérer l'innovation collective.",
    },
    {
      "@type": "SoftwareApplication",
      name: "Mon facilitateur",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
      description:
        "Copilote IA pour préparer, animer et documenter des sessions de facilitation en solo, équipe ou grand atelier.",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col overflow-x-hidden">{children}</body>
    </html>
  );
}
