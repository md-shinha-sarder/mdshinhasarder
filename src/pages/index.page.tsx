import dynamic from "next/dynamic";
import Head from "next/head";

const ClientApp = dynamic(() => import("@/App"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#070e24] flex items-center justify-center text-white">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-blue-300 font-medium">Loading MD. Shinha Sarder Portfolio...</p>
      </div>
    </div>
  ),
});

export default function HomePage() {
  const schemaPerson = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "url": "https://mdshinhasarder.com/",
    "mainEntity": {
      "@type": "Person",
      "name": "MD. Shinha Sarder",
      "alternateName": ["Shinha Sarder", "MDS Sarder"],
      "url": "https://mdshinhasarder.com/",
      "image": "https://mdshinhasarder.com/profile.webp",
      "description": "MD. Shinha Sarder is known as the Founder & CEO of IT Tech BD and Biostar TV World who born on 5 November , 2004.He also known as an Entrepreneur, Musical Artist, Author, Researcher, YouTuber and Content Creator. He regularly upload Content in YouTube, Facebook and other social media.He is a regular student at Computer Science and Engineering (CSE) program in the Northern University of Businesses and Technology, Khulna. He was a former student of Khulna Zilla School. His father (MD. Lutfor Rahaman) is a lawyer. His mother (Samima Sultana) is a private sector employee. He born into a Muslim family in Shirgati village, Aichgati UnionParishad, Khulna.",
      "jobTitle": "Founder & CEO of IT Tech BD and Biostar TV World",
      "birthDate": "2004-11-05",
      "birthPlace": {
        "@type": "Place",
        "name": "Shirgati village, Aichgati UnionParishad, Khulna, Bangladesh"
      },
      "nationality": {
        "@type": "Country",
        "name": "Bangladesh"
      },
      "parent": [
        { "@type": "Person", "name": "MD. Lutfor Rahaman", "jobTitle": "Lawyer" },
        { "@type": "Person", "name": "Samima Sultana", "jobTitle": "Private sector employee" }
      ],
      "alumniOf": [
        { "@type": "EducationalOrganization", "name": "Northern University of Businesses and Technology, Khulna" },
        { "@type": "EducationalOrganization", "name": "Khulna Zilla School" }
      ],
      "founder": [
        { "@type": "Organization", "name": "IT Tech BD" },
        { "@type": "Organization", "name": "Biostar TV World" }
      ],
      "sameAs": [
        "https://www.facebook.com/md.shinha.sarder",
        "https://x.com/mdshinhasarder",
        "https://www.youtube.com/@MD-Shinha-Sarder",
        "https://www.instagram.com/md_shinha_sarder",
        "https://www.linkedin.com/in/md-shinha-sarder/",
        "https://github.com/md-shinha-sarder"
      ]
    }
  };

  return (
    <>
      <Head>
        <title>MD. Shinha Sarder</title>
        <meta name="description" content="MD. Shinha Sarder is known as the Founder &amp; CEO of IT Tech BD and Biostar TV World who born on 5 November , 2004. He also known as an Entrepreneur, Musical Artist, Author, Researcher, YouTuber and Content Creator. Regular student at CSE program in Northern University of Businesses and Technology, Khulna." />
        <meta name="keywords" content="MD. Shinha Sarder, Shinha Sarder, IT Tech BD, Biostar TV World, Founder &amp; CEO, Entrepreneur, Musical Artist, Author, Researcher, YouTuber, Content Creator, Northern University of Businesses and Technology Khulna, Khulna Zilla School, Shirgati village Aichgati, Bangladesh" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://mdshinhasarder.com/" />
        <meta property="og:type" content="profile" />
        <meta property="og:title" content="MD. Shinha Sarder" />
        <meta property="og:description" content="MD. Shinha Sarder is known as the Founder &amp; CEO of IT Tech BD and Biostar TV World who born on 5 November , 2004. He also known as an Entrepreneur, Musical Artist, Author, Researcher, YouTuber and Content Creator." />
        <meta property="og:image" content="https://mdshinhasarder.com/profile.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="MD. Shinha Sarder" />
        <meta name="twitter:description" content="Entrepreneur, Musical Artist, Author, Researcher, YouTuber and Content Creator." />
        <meta name="twitter:image" content="https://mdshinhasarder.com/profile.webp" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaPerson) }} />
      </Head>
      <ClientApp />
    </>
  );
}
