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
  return (
    <>
      <Head>
        <title>MD. Shinha Sarder Portfolio - Engineer &amp; Entrepreneur</title>
        <meta name="description" content="MD. Shinha Sarder is known as the Founder &amp; CEO of IT Tech BD and Biostar TV World. Engineer, Developer, and Entrepreneur specializing in Next.js, Python, Node.js, PHP, and SQL." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <ClientApp />
    </>
  );
}
