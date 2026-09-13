"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  PenSquare,
  Image as ImageIcon,
  Layers,
  Search,
  Settings,
  Globe,
  LogOut,
  ChevronRight,
  Sparkles,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "All Posts", href: "/admin/posts", icon: FileText },
  { label: "New Post", href: "/admin/posts/new", icon: PenSquare, badge: "Editor" },
  { label: "Media Library", href: "/admin/media", icon: ImageIcon },
  { label: "Pages & Sections", href: "/admin/pages", icon: Layers },
  { label: "SEO & Audit", href: "/admin/seo", icon: Search },
  { label: "Site Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border/80 bg-card/90 backdrop-blur-md sticky top-0 z-40">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center text-primary-foreground font-bold text-sm shadow-gold">
            SS
          </div>
          <div>
            <span className="font-serif font-bold text-sm text-foreground">MD. Shinha Sarder</span>
            <span className="text-[10px] block text-amber-400 font-mono">EDGE CMS</span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-foreground"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card/95 border-r border-border/80 flex flex-col transition-transform duration-300 md:translate-x-0 md:static ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Banner */}
        <div className="p-5 border-b border-border/60 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center text-primary-foreground font-bold text-base shadow-gold transition-transform group-hover:scale-105">
              SS
            </div>
            <div>
              <h2 className="font-serif font-bold text-base tracking-wide text-foreground">
                CMS Studio
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono text-muted-foreground">Cloudflare Edge</span>
              </div>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Action button */}
        <div className="px-4 pt-4 pb-2">
          <Link
            href="/admin/posts/new"
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-gradient-gold text-primary-foreground font-medium text-sm shadow-gold transition-all hover:opacity-95 active:scale-[0.98]"
          >
            <PenSquare size={16} />
            <span>Write New Post</span>
          </Link>
        </div>

        {/* Nav Links with Highlight Styling */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] uppercase tracking-wider text-muted-foreground/80 font-mono">
            Management
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
                  isActive
                    ? "bg-amber-400/15 text-amber-300 font-semibold border border-amber-400/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60 hover:translate-x-0.5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={`transition-colors ${
                      isActive
                        ? "text-amber-400"
                        : "text-muted-foreground group-hover:text-amber-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge ? (
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    {item.badge}
                  </span>
                ) : (
                  isActive && (
                    <ChevronRight size={14} className="text-amber-400" />
                  )
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer with Live Site link highlighted */}
        <div className="p-4 border-t border-border/60 bg-secondary/20 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-amber-400 hover:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 transition-colors font-medium"
          >
            <div className="flex items-center gap-2">
              <Globe size={14} />
              <span>View Public Site</span>
            </div>
            <ExternalLink size={12} />
          </Link>

          <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center font-mono text-[10px] text-amber-400 border border-border">
                MD
              </div>
              <div className="truncate max-w-[110px]">
                <p className="truncate text-foreground text-xs font-medium">MD. Shinha</p>
                <p className="text-[10px] text-muted-foreground">Admin</p>
              </div>
            </div>

            <Link
              href="/api/auth/signout"
              className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Sign Out"
            >
              <LogOut size={15} />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <div className="hidden md:flex items-center justify-between px-8 py-4 border-b border-border/60 bg-card/40 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="text-muted-foreground">Admin</span>
            <span>/</span>
            <span className="text-amber-400 font-medium capitalize">
              {pathname === "/admin" ? "Overview" : pathname.replace("/admin/", "").replace("/", " ")}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-amber-400/10 text-amber-400 border border-amber-400/30 font-mono">
              <Sparkles size={12} /> Edge Runtime Active
            </span>
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-300 bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/40 transition-colors shadow-sm"
            >
              <Globe size={13} />
              <span>Live Website</span>
            </Link>
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}
    </div>
  );
}
