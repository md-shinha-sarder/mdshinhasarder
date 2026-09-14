import React, { forwardRef } from 'react';
import {
  Link as RouterLink,
  NavLink as RouterNavLink,
  useNavigate as useRouterNavigate,
  useLocation as useRouterLocation,
  useParams as useRouterParams,
  useSearchParams as useRouterSearchParams,
  Outlet as RouterOutlet,
} from 'react-router-dom';

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href?: string;
  to?: string;
  children?: React.ReactNode;
  className?: string;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(({ href, to, children, ...props }, ref) => {
  const target = href || to || '#';
  if (
    target.startsWith('http://') ||
    target.startsWith('https://') ||
    target.startsWith('mailto:') ||
    target.startsWith('tel:') ||
    target.startsWith('#')
  ) {
    return (
      <a ref={ref} href={target} {...props}>
        {children}
      </a>
    );
  }
  return (
    <RouterLink ref={ref} to={target} {...props}>
      {children}
    </RouterLink>
  );
});
Link.displayName = 'Link';

export function useNavigate() {
  const nav = useRouterNavigate();
  return (path: string | number) => {
    nav(path as any);
  };
}

export function useLocation() {
  return useRouterLocation();
}

export function useParams<T extends Record<string, string | string[]> = Record<string, string>>(): T {
  const params = useRouterParams();
  return (params || {}) as unknown as T;
}

export function useSearchParams(): [URLSearchParams, (newParams: Record<string, string> | URLSearchParams) => void] {
  return useRouterSearchParams();
}

export interface NavLinkProps extends Omit<LinkProps, 'className'> {
  end?: boolean;
  className?: string | ((props: { isActive: boolean }) => string);
}

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ to, href, className, end, children, ...props }, ref) => {
    const target = href || to || '#';
    return (
      <RouterNavLink
        ref={ref}
        to={target}
        end={end}
        className={({ isActive }) =>
          typeof className === 'function' ? className({ isActive }) : className || ''
        }
        {...props}
      >
        {children}
      </RouterNavLink>
    );
  }
);
NavLink.displayName = 'NavLink';

export const Outlet = RouterOutlet;

