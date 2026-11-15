import type { Metadata, Viewport } from "next";
import { gilroy, instrument, monument } from "./fonts";
import { getSite } from "@/lib/store";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.cap.direct";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: site.seo.title, template: `%s — ${site.company.name}` },
    description: site.seo.description,
    openGraph: {
      type: "website",
      siteName: `${site.company.name} Agency`,
      title: site.seo.title,
      description: site.seo.description,
      images: site.seo.ogImage ? [{ url: site.seo.ogImage, width: 1200, height: 630 }] : undefined,
    },
    twitter: { card: "summary_large_image", title: site.seo.title, description: site.seo.description },
  };
}

export const viewport: Viewport = { themeColor: "#f2eee7" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${gilroy.variable} ${monument.variable} ${instrument.variable}`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
