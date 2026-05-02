'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const playerLinks = [
  { href: '/', label: 'Home' },
  { href: '/pcs', label: 'Party' },
  { href: '/locations', label: 'Locs' },
  { href: '/npcs', label: 'NPCs' },
  { href: '/sessions', label: 'Logs' },
  { href: '/map', label: 'Map' },
];

const dmLinks = [
  { href: '/dm', label: 'Home' },
  { href: '/dm/pcs', label: 'Party' },
  { href: '/dm/locations', label: 'Locs' },
  { href: '/dm/npcs', label: 'NPCs' },
  { href: '/dm/sessions', label: 'Logs' },
  { href: '/dm/plots', label: 'Plot' },
  { href: '/dm/map', label: 'Map' },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/' || href === '/dm') return pathname === href;
  return pathname === href || pathname.startsWith(href + '/');
}

export function MobileNav() {
  const pathname = usePathname();
  const inDmArea = pathname.startsWith('/dm');
  const links = inDmArea ? dmLinks : playerLinks;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 backdrop-blur-md bg-ink-deep/90 border-t border-border flex justify-around py-2 z-50 px-1">
      <span className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-gold-dim/40 to-transparent" />
      {links.map(l => {
        const active = isActive(pathname, l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`relative px-1.5 py-1 text-[0.6rem] tracking-[0.18em] uppercase display transition-colors ${
              active ? 'text-gold' : 'text-vellum-dim'
            }`}
          >
            {l.label}
            {active && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold shadow-[0_0_8px_var(--gold)]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
