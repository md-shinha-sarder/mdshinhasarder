import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: "MD. Shinha Sarder — Founder & CEO of IT Tech BD and Biostar TV World",
  description: "MD. Shinha Sarder is known as the Founder & CEO of IT Tech BD and Biostar TV World who was born on 5 November, 2004. He is also known as an Engineer, Developer.",
  keywords: ["MD. Shinha Sarder", "Shinha Sarder", "IT Tech BD", "Biostar TV World", "Founder CEO", "Engineer", "Developer", "Bangladesh", "Khulna"],
  authors: [{ name: "MD. Shinha Sarder", url: "https://mdshinhasarder.com/" }],
  metadataBase: new URL("https://mdshinhasarder.com"),
  alternates: {
    canonical: "https://mdshinhasarder.com/",
    types: {
      "application/rss+xml": "/rss.xml",
      "application/atom+xml": "/atom.xml",
    },
  },
  verification: {
    google: "qe7bJ5Boz_ShFOfR7VpdQn8vVy5ve4DQHAtspAc6CVk",
  },
  openGraph: {
    title: "MD. Shinha Sarder",
    description: "MD. Shinha Sarder is known as the Founder & CEO of IT Tech BD and Biostar TV World who was born on 5 November, 2004. He is also known as an Engineer, Developer.",
    url: "https://mdshinhasarder.com/",
    siteName: "MD. Shinha Sarder",
    images: [
      {
        url: "https://mdshinhasarder.com/profile.webp",
        width: 1200,
        height: 1200,
        alt: "MD. Shinha Sarder — Founder & CEO of IT Tech BD",
      },
    ],
    locale: "bn_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MD. Shinha Sarder",
    description: "Founder & CEO of IT Tech BD and Biostar TV World. Engineer & Developer.",
    creator: "@mdshinhasarder",
    site: "@mdshinhasarder",
    images: ["https://mdshinhasarder.com/profile.webp"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "MD. Shinha Sarder",
  "alternateName": "MD. Shinha Sarder Official",
  "url": "https://mdshinhasarder.com/",
  "image": "https://mdshinhasarder.com/profile.webp",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://mdshinhasarder.com/posts?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "url": "https://mdshinhasarder.com/",
  "mainEntity": {
    "@type": "Person",
    "name": "MD. Shinha Sarder",
    "url": "https://mdshinhasarder.com/",
    "image": "https://mdshinhasarder.com/profile.webp",
    "jobTitle": "Software Developer & Entrepreneur",
    "birthDate": "2004-11-05",
    "birthPlace": "Khulna, Bangladesh",
    "nationality": "Bangladeshi",
    "alumniOf": "Northern University of Businesses and Technology, Khulna",
    "sameAs": [
      "https://www.facebook.com/md.shinha.sarder",
      "https://x.com/mdshinhasarder",
      "https://www.youtube.com/@MD-Shinha-Sarder",
      "https://www.instagram.com/md_shinha_sarder",
      "https://www.linkedin.com/in/md-shinha-sarder/",
      "https://github.com/md-shinha-sarder",
      "https://www.mdshinhasarder.com/"
    ],
    "worksFor": [
      { "@type": "Organization", "name": "IT Tech BD" },
      { "@type": "Organization", "name": "Biostar TV World" }
    ]
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className="dark">
      <head>
        <meta name="theme-color" content="#080b12" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
