interface OrnamentProps {
  variant?: 'flourish' | 'rule' | 'dot';
  className?: string;
}

export function Ornament({ variant = 'flourish', className = '' }: OrnamentProps) {
  if (variant === 'dot') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <span className="text-[color:var(--gold-dim)] tracking-[0.6em] select-none">·······</span>
      </div>
    );
  }
  if (variant === 'rule') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[color:var(--gold-dim)]/40 to-transparent" />
        <span className="text-[color:var(--gold-dim)] text-xs select-none">❦</span>
        <span className="h-px flex-1 bg-gradient-to-r from-[color:var(--gold-dim)]/40 via-[color:var(--gold-dim)]/40 to-transparent" />
      </div>
    );
  }
  return (
    <svg
      viewBox="0 0 240 14"
      className={`w-full h-3 fill-none stroke-[color:var(--gold-dim)] ${className}`}
      aria-hidden
    >
      <path
        d="M2 7 L100 7 M140 7 L238 7"
        strokeWidth="0.6"
        opacity="0.55"
      />
      <path
        d="M104 7 c4 -4 8 -4 12 0 s8 4 12 0"
        strokeWidth="0.7"
        opacity="0.85"
      />
      <circle cx="120" cy="7" r="1.6" fill="var(--gold)" stroke="none" opacity="0.9" />
    </svg>
  );
}
