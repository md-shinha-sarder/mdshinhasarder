import dynamic from "next/dynamic";
import Head from "next/head";

const ClientApp = dynamic(() => import("@/App"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#070e24] flex items-center justify-center text-white">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-blue-300 font-medium">Loading...</p>
      </div>
    </div>
  ),
});

export default function Custom404() {
  return (
    <>
      <Head>
        <title>MD. Shinha Sarder Portfolio</title>
      </Head>
      <ClientApp />
    </>
  );
}
