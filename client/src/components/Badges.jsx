import { brandLogo, familyLogo, brandOf } from '../brands';

const BRAND_COLORS = { Sony: '#4da3ff', Nintendo: '#ff6b6b', PC: '#9c8cff' };

function brandColor(b) {
  return BRAND_COLORS[b] || '#8991aa';
}

export function GamepadIcon({ size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 11v2M5 12h2" />
      <path d="M15.5 11h.01M17.5 13h.01" />
      <path d="M7.5 6h9A5.5 5.5 0 0 1 22 11.5v2A3.5 3.5 0 0 1 18.5 17c-1.1 0-1.7-.6-2.7-1.7-.7-.8-1-.8-1.8-.8h-4c-.8 0-1.1 0-1.8.8C7.2 16.4 6.6 17 5.5 17A3.5 3.5 0 0 1 2 13.5v-2A5.5 5.5 0 0 1 7.5 6z" />
    </svg>
  );
}

export function BrandBadge({ brand }) {
  const logo = brandLogo(brand);
  if (logo) {
    return (
      <span className="brand-badge brand-badge--logo">
        <img src={logo} alt={brand} />
      </span>
    );
  }
  const c = brandColor(brand);
  return (
    <span className="brand-badge" style={{ background: `${c}22`, color: c }}>
      <GamepadIcon size={13} />
    </span>
  );
}

export function FamilyBadge({ family }) {
  const logo = familyLogo(family);
  if (logo) {
    return (
      <span className="brand-badge brand-badge--logo">
        <img src={logo} alt={family} />
      </span>
    );
  }
  return <BrandBadge brand={brandOf(family)} />;
}

export function Thumb({ src, size = 'sm' }) {
  const cls = size === 'lg' ? 'thumb-lg' : 'thumb';
  const placeholderCls = size === 'lg' ? 'thumb-placeholder-lg' : 'thumb-placeholder';
  if (src) return <img className={cls} src={src} alt="" />;
  return (
    <div className={placeholderCls}>
      <GamepadIcon size={size === 'lg' ? 28 : 16} />
    </div>
  );
}
