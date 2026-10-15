import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import BiographyPage from "./BiographyPage";
import SongsPage from "./SongsPage";
import BooksPage from "./BooksPage";
import GalleryPage from "./GalleryPage";
import PublicationsPage from "./PublicationsPage";
import SkillsPage from "./SkillsPage";
import ProjectsPage from "./ProjectsPage";
import AllPosts from "./AllPosts";
import PostDetail from "./PostDetail";

const PageDispatcher: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const cleanSlug = useMemo(() => {
    if (!slug) return "";
    try {
      return decodeURIComponent(slug).toLowerCase().replace(/\.html?$/, "").trim();
    } catch {
      return slug.toLowerCase().replace(/\.html?$/, "").trim();
    }
  }, [slug]);

  switch (cleanSlug) {
    case "biography":
    case "about":
    case "bio":
      return <BiographyPage />;
    case "skills":
    case "skill":
    case "expertise":
      return <SkillsPage />;
    case "projects":
    case "project":
    case "ventures":
      return <ProjectsPage />;
    case "songs":
    case "song":
    case "music":
    case "discography":
      return <SongsPage />;
    case "books":
    case "book":
      return <BooksPage />;
    case "gallery":
    case "photos":
    case "photo":
      return <GalleryPage />;
    case "publication":
    case "publications":
      return <PublicationsPage />;
    case "posts":
    case "post":
    case "blog":
    case "articles":
      return <AllPosts />;
    default:
      // Delegate to PostDetail which resolves dynamic posts or renders verified 404 design board
      return <PostDetail />;
  }
};

export default PageDispatcher;
