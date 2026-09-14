import React, { forwardRef } from 'react';
import {
  Link as RouterLink,
  NavLink as RouterNavLink,
  useNavigate as useRouterNavigate,
  useLocation as useRouterLocation,
  useParams as useRouterParams,
  useSearchParams as useRouterSearchParams,
  useInRouterContext,
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
  const inRouter = useInRouterContext();

  if (
    !inRouter ||
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
  const inRouter = useInRouterContext();
  const nav = inRouter ? useRouterNavigate() : null;

  return (path: string | number) => {
    if (nav) {
      nav(path as any);
      return;
    }
    if (typeof window !== 'undefined') {
      if (typeof path === 'number') {
        window.history.go(path);
      } else {
        window.location.href = path;
      }
    }
  };
}

export function useLocation() {
  const inRouter = useInRouterContext();
  const loc = inRouter ? useRouterLocation() : null;

  if (loc) return loc;

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const search = typeof window !== 'undefined' ? window.location.search : '';
  const hash = typeof window !== 'undefined' ? window.location.hash : '';

  return {
    pathname,
    search,
    hash,
    state: null,
    key: 'default',
  };
}

export function useParams<T extends Record<string, string | string[]> = Record<string, string>>(): T {
  const inRouter = useInRouterContext();
  const params = inRouter ? useRouterParams() : null;
  return (params || {}) as unknown as T;
}

export function useSearchParams(): [URLSearchParams, (newParams: Record<string, string> | URLSearchParams) => void] {
  const inRouter = useInRouterContext();
  const routerSearchParams = inRouter ? useRouterSearchParams() : null;

  if (routerSearchParams) {
    return routerSearchParams;
  }

  const searchStr = typeof window !== 'undefined' ? window.location.search : '';
  const current = new URLSearchParams(searchStr);

  const setParams = (newParams: Record<string, string> | URLSearchParams) => {
    if (typeof window !== 'undefined') {
      const next = new URLSearchParams(
        newParams instanceof URLSearchParams ? newParams : newParams
      );
      const newUrl = `${window.location.pathname}?${next.toString()}`;
      window.history.pushState(null, '', newUrl);
    }
  };

  return [current, setParams];
}

export interface NavLinkProps extends Omit<LinkProps, 'className'> {
  end?: boolean;
  className?: string | ((props: { isActive: boolean }) => string);
}

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ to, href, className, end, children, ...props }, ref) => {
    const inRouter = useInRouterContext();
    const target = href || to || '#';

    if (!inRouter) {
      const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
      const isActive = end ? pathname === target : pathname === target || pathname.startsWith(`${target}/`);
      const computedClassName = typeof className === 'function' ? className({ isActive }) : className || '';
      return (
        <a ref={ref} href={target} className={computedClassName} {...props}>
          {children}
        </a>
      );
    }

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


