/** Pages in the header and footer. A page is listed only once it exists. */
export interface NavItem {
  key: string;
  label: string;
  href: string;
}

export const NAV: NavItem[] = [
  { key: 'schemes', label: 'Schemes', href: '/schemes/' },
  { key: 'data', label: 'Data', href: '/data/' },
  { key: 'about', label: 'About', href: '/about/' },
];

/** Which header tab a path belongs to. */
export function activeKey(pathname: string): string | undefined {
  if (pathname === '/') return undefined;
  return NAV.find((item) => pathname.startsWith(item.href))?.key;
}
