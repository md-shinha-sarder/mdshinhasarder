'use client';

import React, { forwardRef } from 'react';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import {
  useRouter as useNextRouter,
  usePathname as useNextPathname,
  useSearchParams as useNextSearchParams,
  useParams as useNextParams,
} from 'next/navigation';

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href?: string;
  to?: string;
  children?: React.ReactNode;
  className?: string;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(({ href, to, children, ...props }, ref) => {
  const target = href || to || '#';
  return (
    <NextLink ref={ref} href={target} {...props}>
      {children}
    </NextLink>
  );
});
Link.displayName = 'Link';

export function useNavigate() {
  const router = useNextRouter();
  return (path: string | number) => {
    if (typeof path === 'number') {
      if (path === -1) router.back();
      return;
    }
    router.push(path);
  };
}

export function useLocation() {
  const pathname = useNextPathname() || '/';
  return {
    pathname,
    search: '',
    hash: '',
    state: null,
    key: 'default',
  };
}

export function useParams<T extends Record<string, string | string[]> = Record<string, string>>(): T {
  const params = useNextParams();
  return (params || {}) as T;
}

export function useSearchParams(): [URLSearchParams, (newParams: Record<string, string> | URLSearchParams) => void] {
  const searchParams = useNextSearchParams();
  const router = useNextRouter();
  const pathname = useNextPathname() || '';

  const setParams = (newParams: Record<string, string> | URLSearchParams) => {
    const next = new URLSearchParams(
      newParams instanceof URLSearchParams ? newParams : newParams
    );
    router.push(`${pathname}?${next.toString()}`);
  };

  const current = searchParams ? new URLSearchParams(searchParams.toString()) : new URLSearchParams();
  return [current, setParams];
}

export interface NavLinkProps extends Omit<LinkProps, 'className'> {
  end?: boolean;
  className?: string | ((props: { isActive: boolean }) => string);
}

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ to, href, className, end, children, ...props }, ref) => {
    const pathname = useNextPathname() || '/';
    const target = href || to || '#';
    const isActive = end ? pathname === target : pathname === target || pathname.startsWith(`${target}/`);

    const computedClassName = typeof className === 'function' ? className({ isActive }) : className;

    return (
      <NextLink ref={ref} href={target} className={computedClassName} {...props}>
        {children}
      </NextLink>
    );
  }
);
NavLink.displayName = 'NavLink';

export const Outlet = ({ children }: { children?: React.ReactNode }) => {
  return <>{children}</>;
};
