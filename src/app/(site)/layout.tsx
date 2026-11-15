import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import SmoothScroll from "@/components/site/SmoothScroll";
import MotionProvider from "@/components/site/Motion";
import BrandRings from "@/components/site/BrandRings";
import { getSite } from "@/lib/store";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const site = await getSite();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: `${site.company.name} Agency`,
    legalName: site.company.legalName,
    email: site.company.email,
    telephone: site.company.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.company.addressLines[0],
      addressLocality: "Dhaka",
      addressCountry: "BD",
    },
    sameAs: site.socials.map((s) => s.url),
  };

  return (
    <div className="grain">
      <MotionProvider>
        <SmoothScroll />
        <BrandRings />
        <Header email={site.company.email} socials={site.socials} />
        <main id="main" className="relative z-[1]">{children}</main>
        <div className="relative z-[1]">
          <Footer site={site} />
        </div>
      </MotionProvider>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
