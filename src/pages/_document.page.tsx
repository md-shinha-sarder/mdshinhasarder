import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="dark">
      <Head>
        <meta charSet="UTF-8" />
        <meta content="qe7bJ5Boz_ShFOfR7VpdQn8vVy5ve4DQHAtspAc6CVk" name="google-site-verification" />
        <meta name="theme-color" content="#070e24" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="preconnect" href="https://hpnndbmyibbgrlskskyt.supabase.co" />
        <link rel="dns-prefetch" href="https://hpnndbmyibbgrlskskyt.supabase.co" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="alternate" type="application/rss+xml" title="MD. Shinha Sarder — RSS Feed" href="/rss.xml" />
        <link rel="alternate" type="application/atom+xml" title="MD. Shinha Sarder — Atom Feed" href="/atom.xml" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      </Head>
      <body className="bg-[#070e24] text-slate-100 antialiased selection:bg-blue-500/30 selection:text-blue-200">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

