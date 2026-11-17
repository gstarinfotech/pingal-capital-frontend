import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Playfair_Display, Inter } from "next/font/google";
import Script from "next/script";
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
import WhatsAppButton from "@/components/WhatsappButton";
import { applySeoMetadata, getSiteSettings } from "@/lib/admin-settings";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseMetadata = {
  metadataBase: new URL("https://www.pingalcapital.com"),
  title: "Home Loans, Business Loans & Real Estate Project Funding | Pingal Capital",
  description: "Pingal Capital specializes in Home Loans, loan against property, Working Capital, Debt consolidation Business Loans,Structured Finance, Builder & Construction Finance loans across India.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Pingal Capital",
    title: "Home Loans, Business Loans & Real Estate Project Funding | Pingal Capital",
    description: "Pingal Capital specializes in Home Loans, loan against property, Working Capital, Debt consolidation Business Loans,Structured Finance, Builder & Construction Finance loans across India.",
    url: "/",
  },
  twitter: { card: "summary_large_image" },
};

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return applySeoMetadata("/", baseMetadata);
}
const brandColors = {
  Facebook: "#1877F2",
  YouTube: "#FF0000",
  LinkedIn: "#0A66C2",
  Instagram: "#E1306C",
};

export default async function RootLayout({ children }) {
  const siteSettings = await getSiteSettings();
  const analyticsId = siteSettings?.googleAnalyticsId || "";
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        {analyticsId ? (
          <>
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="pingal-google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){window.dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${analyticsId}');
              `}
            </Script>
          </>
        ) : null}
      </head>
      <body className="min-h-full flex flex-col">
        {/* Top Bar */}
        <div style={{ background: "#0a2660" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3">
              <p className="font-inter text-blue-200" style={{ fontSize: "13px" }}>
                📞 +91 9899037555 | info@pingalcapital.com
              </p>
              <div className="flex items-center gap-3">
                {[
                  { icon: <FaFacebook size={18} />, label: "Facebook", link: "https://www.facebook.com/pingalcapital" },
                  { icon: <FaYoutube size={18} />, label: "YouTube", link: "https://www.youtube.com/channel/UCv9kbIQ_hOMC_brMuFVwo6A" },
                  { icon: <FaLinkedin size={18} />, label: "LinkedIn", link: "https://www.linkedin.com/in/ajay-sahore-a205b780/" },
                  { icon: <FaInstagram size={18} />, label: "Instagram", link: "https://www.instagram.com/pingal_capital" },
                ].map((social, i) => (
                  <a
                    key={i}
                    href={social.link}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded-lg border transition-colors hover:bg-white/10"
                    style={{ borderColor: "rgba(255,255,255,0.25)", color: "#fff" }}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        {children}
        <Script src="https://elfsightcdn.com/platform.js" strategy="lazyOnload" />
        <WhatsAppButton />
      </body>
    </html >
  );
}
