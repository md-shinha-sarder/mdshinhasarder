import dynamic from "next/dynamic";
import Head from "next/head";
import type { GetStaticPaths, GetStaticProps } from "next";

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

export default function CatchAllPage() {
  return (
    <>
      <Head>
        <title>MD. Shinha Sarder - Founder &amp; CEO of IT Tech BD &amp; Biostar TV World</title>
        <meta name="description" content="MD. Shinha Sarder is known as the Founder &amp; CEO of IT Tech BD and Biostar TV World who born on 5 November , 2004. He also known as an Entrepreneur, Musical Artist, Author, Researcher, YouTuber and Content Creator. Regular student at CSE program in Northern University of Businesses and Technology, Khulna." />
      </Head>
      <ClientApp />
    </>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      { params: { slug: ["posts"] } },
      { params: { slug: ["auth"] } },
      { params: { slug: ["admin"] } },
    ],
    fallback: "blocking",
  };
};

// eslint-disable-next-line react-refresh/only-export-components
export const getStaticProps: GetStaticProps = async () => {
  return { props: {} };
};
