import React from "react";
import { BadgeCheck, ExternalLink, LucideIcon } from "lucide-react";

export interface InfoboxFact {
  label: string;
  value: React.ReactNode;
}

export interface InfoboxStat {
  label: string;
  value: string | number;
  subtext?: string;
  color?: string;
}

export interface InfoboxAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  primary?: boolean;
  external?: boolean;
}

interface PageInfoboxProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeIcon?: LucideIcon;
  avatarUrl?: string;
  avatarAlt?: string;
  verified?: boolean;
  stats?: InfoboxStat[];
  facts?: InfoboxFact[];
  actions?: InfoboxAction[];
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export const PageInfobox: React.FC<PageInfoboxProps> = ({
  title,
  subtitle,
  badge = "Official Verified Entity",
  badgeIcon: BadgeIcon = BadgeCheck,
  avatarUrl = "/profile.webp",
  avatarAlt = "MD. Shinha Sarder",
  verified = true,
  stats,
  facts,
  actions,
  description,
  children,
  className = "",
}) => {
  return (
    <aside
      aria-label="Verified Knowledge & Entity Infobox"
      className={`w-full rounded-2xl sm:rounded-3xl blue-uix-board p-5 sm:p-7 md:p-8 mb-8 text-slate-100 ${className}`}
    >
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-blue-500/25">
        {/* Avatar with Verified Glow */}
        {avatarUrl && (
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-1 bg-gradient-to-tr from-blue-600 via-sky-400 to-indigo-600 shadow-lg shadow-blue-500/25">
              <img
                src={avatarUrl}
                alt={avatarAlt}
                className="w-full h-full rounded-xl object-cover object-top border-2 border-slate-950 bg-slate-900"
                onError={(e) => {
                  e.currentTarget.src = "/profile.webp";
                }}
              />
            </div>
            {verified && (
              <span
                title="Verified Entity"
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white ring-2 ring-slate-950 shadow-md"
              >
                <BadgeCheck className="w-4 h-4 fill-blue-600 text-white" />
              </span>
            )}
          </div>
        )}

        {/* Identity & Subtitles */}
        <div className="flex-1 text-center sm:text-left min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold text-sky-200 bg-blue-950/90 border border-blue-400/40 shadow-sm">
              <BadgeIcon className="w-3.5 h-3.5 text-sky-400" />
              <span>{badge}</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center justify-center sm:justify-start gap-2 flex-wrap">
            <span>{title}</span>
            {verified && <BadgeCheck className="w-5 h-5 text-sky-400 fill-blue-500/20" />}
          </h2>

          {subtitle && (
            <p className="text-xs sm:text-sm text-sky-300 font-semibold mt-1">
              {subtitle}
            </p>
          )}

          {description && (
            <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed max-w-3xl">
              {description}
            </p>
          )}
        </div>

        {/* Optional Header Actions */}
        {actions && actions.length > 0 && (
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 flex-shrink-0 w-full sm:w-auto pt-2 sm:pt-0">
            {actions.map((act, i) => {
              const Icon = act.icon;
              const content = (
                <>
                  {Icon && <Icon size={14} className={act.primary ? "text-white" : "text-sky-300"} />}
                  <span>{act.label}</span>
                  {act.external && <ExternalLink size={12} className="opacity-80" />}
                </>
              );

              const btnClass = act.primary
                ? "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all hover:scale-105"
                : "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-950/70 hover:bg-blue-900/80 text-blue-200 hover:text-white text-xs font-semibold border border-blue-500/30 transition-colors";

              if (act.href) {
                return (
                  <a
                    key={i}
                    href={act.href}
                    target={act.external ? "_blank" : undefined}
                    rel={act.external ? "noreferrer" : undefined}
                    className={btnClass}
                  >
                    {content}
                  </a>
                );
              }
              return (
                <button key={i} type="button" onClick={act.onClick} className={btnClass}>
                  {content}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Metrics Bar (if provided) */}
      {stats && stats.length > 0 && (
        <div className="py-4 border-b border-blue-500/20 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((st, i) => (
            <div
              key={i}
              className="blue-uix-card p-3 rounded-xl flex flex-col justify-center items-center text-center"
            >
              <span className={`text-lg sm:text-xl font-bold font-mono ${st.color || "text-sky-300"}`}>
                {st.value}
              </span>
              <span className="text-[11px] uppercase font-bold tracking-wider text-blue-200/90 mt-0.5">
                {st.label}
              </span>
              {st.subtext && (
                <span className="text-[10px] text-blue-300/80 mt-0.5">{st.subtext}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Entity Facts Table (if provided) */}
      {facts && facts.length > 0 && (
        <div className="pt-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider font-bold text-sky-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span>Verified Entity Details &amp; Metadata</span>
            </span>
            <span className="text-[11px] text-blue-300/70 font-mono">Google Knowledge Graph Schema</span>
          </div>

          <div className="border border-blue-500/35 rounded-xl overflow-hidden shadow-lg bg-[#061230]/80">
            <table className="w-full text-xs sm:text-sm text-left divide-y divide-blue-500/20">
              <tbody className="divide-y divide-blue-500/20">
                {facts.map((f, i) => (
                  <tr key={i} className="hover:bg-blue-900/30 transition-colors">
                    <th className="py-2.5 sm:py-3 px-3.5 sm:px-4 bg-blue-950/80 text-blue-200 font-bold w-40 sm:w-56 align-top">
                      {f.label}
                    </th>
                    <td className="py-2.5 sm:py-3 px-3.5 sm:px-4 text-white font-medium align-top leading-relaxed">
                      {f.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Additional Custom Child Content */}
      {children && <div className="pt-5">{children}</div>}
    </aside>
  );
};

export default PageInfobox;
