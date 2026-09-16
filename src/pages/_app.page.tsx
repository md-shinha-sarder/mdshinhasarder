import type { AppProps } from "next/app";
import Head from "next/head";
import { HelmetProvider } from "react-helmet-async";
import ErrorBoundary from "@/components/ErrorBoundary";
import "@/index.css";
import "@/App.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <HelmetProvider>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#070e24" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="preload" as="image" href="/profile.webp" {...({ fetchpriority: "high" } as any)} type="image/webp" />
      </Head>
      <ErrorBoundary>
        <Component {...pageProps} />
      </ErrorBoundary>
    </HelmetProvider>
  );
}
