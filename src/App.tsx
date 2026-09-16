import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import PostDetail from "./pages/PostDetail.tsx";
import AllPosts from "./pages/AllPosts.tsx";
import AdminLayout from "./components/admin/AdminLayout.tsx";
import Dashboard from "./pages/admin/Dashboard.tsx";
import PagesAdmin from "./pages/admin/PagesAdmin.tsx";
import PostsAdmin from "./pages/admin/PostsAdmin.tsx";
import MediaAdmin from "./pages/admin/MediaAdmin.tsx";
import SeoAdmin from "./pages/admin/SeoAdmin.tsx";
import ThemeAdmin from "./pages/admin/ThemeAdmin.tsx";
import NewsCheckAdmin from "./pages/admin/NewsCheckAdmin.tsx";
import TechVersionAdmin from "./pages/admin/TechVersionAdmin.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
};

const AppRoutes = () => {
  const { pathname } = useLocation();
  const showFloat = !pathname.startsWith("/admin") && !pathname.startsWith("/auth");

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/posts" element={<AllPosts />} />
        <Route path="/post/:slug" element={<PostDetail />} />
        <Route path="/article/:slug" element={<PostDetail />} />
        <Route path="/p/:slug" element={<PostDetail />} />
        <Route path="/:year/:month/:slug" element={<PostDetail />} />
        <Route path="/:year/:month/:day/:slug" element={<PostDetail />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="tech-version" element={<TechVersionAdmin />} />
          <Route path="pages" element={<PagesAdmin />} />
          <Route path="posts" element={<PostsAdmin />} />
          <Route path="media" element={<MediaAdmin />} />
          <Route path="news-check" element={<NewsCheckAdmin />} />
          <Route path="seo" element={<SeoAdmin />} />
          <Route path="theme" element={<ThemeAdmin />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showFloat && <WhatsAppFloat />}
    </>
  );
};

const App = () => (
  <HelmetProvider>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </HelmetProvider>
);

export default App;
