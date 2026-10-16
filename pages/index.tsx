import dynamic from "next/dynamic";
import Head from "next/head";
import ErrorBoundary from "@/components/ErrorBoundary";

const ClientApp = dynamic(() => import("@/App"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-black dark:text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-blue-600 dark:text-blue-300 font-medium">Loading MD. Shinha Sarder...</p>
      </div>
    </div>
  ),
});

export default function HomePage() {
  return (
    <ErrorBoundary>
      <Head>
        <title>MD. Shinha Sarder</title>
        <meta property="og:title" content="MD. Shinha Sarder" />
        <meta
          name="description"
          content="Official portfolio, biography, book catalog, music releases, and software systems of MD. Shinha Sarder."
        />
        <link rel="canonical" href="https://mdshinhasarder.com/" />
      </Head>
      <ClientApp />
    </ErrorBoundary>
  );
}
