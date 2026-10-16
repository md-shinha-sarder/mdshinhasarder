import dynamic from "next/dynamic";
import Head from "next/head";
import type { GetStaticPaths, GetStaticProps } from "next";
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

export default function BloggerPageRoute({ pageTitle }: { pageTitle?: string }) {
  const fullTitle = pageTitle && pageTitle !== "MD. Shinha Sarder" ? `${pageTitle} - MD. Shinha Sarder` : "MD. Shinha Sarder";

  return (
    <ErrorBoundary>
      <Head>
        <title>{fullTitle}</title>
        <meta property="og:title" content={fullTitle} />
      </Head>
      <ClientApp />
    </ErrorBoundary>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = [
    "gallery.html",
    "gallery",
    "biography.html",
    "biography",
    "about.html",
    "about",
    "skills.html",
    "skills",
    "projects.html",
    "projects",
    "publication.html",
    "publications.html",
    "publication",
    "publications",
    "books.html",
    "books",
    "songs.html",
    "songs",
    "music.html",
    "music",
    "posts.html",
    "blog.html",
  ];

  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: false, // Non-matching routes automatically route to pages/404.tsx!
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = String(params?.slug || "").replace(/\.html$/, "").toLowerCase();
  const titles: Record<string, string> = {
    gallery: "Gallery",
    biography: "Biography",
    about: "Biography",
    skills: "Skills",
    projects: "Projects",
    publication: "Publications",
    publications: "Publications",
    books: "Books",
    songs: "Songs",
    music: "Songs",
    posts: "Blog",
    blog: "Blog",
  };
  const pageTitle = titles[slug] || "MD. Shinha Sarder";
  return { props: { pageTitle } };
};
