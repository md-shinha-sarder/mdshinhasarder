import Head from "next/head";
import Link from "next/link";
import { AlertCircle, Home, RefreshCw } from "lucide-react";

interface ErrorProps {
  statusCode?: number;
}

export default function ErrorPage({ statusCode }: ErrorProps) {
  return (
    <>
      <Head>
        <title>MD. Shinha Sarder</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="min-h-screen bg-[#070e24] text-white flex items-center justify-center p-6 selection:bg-blue-500/30">
        <div className="max-w-md w-full bg-[#0c183a]/95 border border-blue-500/30 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-14 h-14 bg-blue-500/15 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-5 text-blue-400">
            <AlertCircle size={28} />
          </div>
          <h1 className="text-2xl font-serif font-bold text-white mb-2">
            {statusCode ? `Error ${statusCode}` : "Loading MD. Shinha Sarder"}
          </h1>
          <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            The page is ready. If you were viewing an article or portfolio project, click reload to continue or return home.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                if (typeof window !== "undefined") window.location.reload();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg"
            >
              <RefreshCw size={15} /> Reload
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#14234b] hover:bg-[#1a2e63] border border-blue-400/30 text-blue-200 font-medium text-sm transition-all"
            >
              <Home size={15} /> Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

ErrorPage.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};
