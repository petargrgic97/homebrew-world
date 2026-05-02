'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/useAuth';

const playerLinks = [
  { href: '/', label: 'Cover' },
  { href: '/pcs', label: 'Party' },
  { href: '/locations', label: 'Locations' },
  { href: '/npcs', label: 'Personae' },
  { href: '/sessions', label: 'Chronicle' },
  { href: '/map', label: 'Map' },
];

const dmLinks = [
  { href: '/dm', label: 'Cover' },
  { href: '/dm/pcs', label: 'Party' },
  { href: '/dm/locations', label: 'Locations' },
  { href: '/dm/npcs', label: 'Personae' },
  { href: '/dm/sessions', label: 'Chronicle' },
  { href: '/dm/plots', label: 'Schemes' },
  { href: '/dm/map', label: 'Map' },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/' || href === '/dm') return pathname === href;
  return pathname === href || pathname.startsWith(href + '/');
}

export function Sidebar() {
  const pathname = usePathname();
  const { isDM } = useAuth();
  const inDmArea = pathname.startsWith('/dm');
  const links = inDmArea ? dmLinks : playerLinks;

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col bg-ink-deep/95 border-r border-border relative">
      <span className="absolute top-0 right-0 bottom-0 w-px bg-linear-to-b from-transparent via-gold-dim/40 to-transparent" />

      <div className="px-6 pt-7 pb-5 border-b border-border">
        <Link href={inDmArea ? '/dm' : '/'} className="block group">
          <div className="text-[0.6rem] tracking-[0.45em] uppercase text-gold-dim display">
            {inDmArea ? "Dungeon Master's" : 'Players’'}
          </div>
          <div className="display-decorative font-bold text-lg mt-1 leading-tight text-gold">
            Homebrew World
          </div>
          <div className="text-[0.65rem] italic text-vellum-dim mt-1 tracking-wide">
            a chronicle
          </div>
        </Link>
      </div>

      <nav className="flex-1 py-3">
        {links.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className={`nav-link ${isActive(pathname, l.href) ? 'active' : ''}`}
          >
            {l.label}
          </Link>
        ))}
      </nav>

      {!inDmArea && isDM && (
        <Link
          href="/dm"
          className="mx-4 mb-4 px-3 py-2 text-center text-[0.65rem] tracking-[0.35em] uppercase display border border-gold-dim/40 text-gold hover:bg-gold/5 transition-colors rounded-sm"
        >
          enter the keep
        </Link>
      )}
    </aside>
  );
}
