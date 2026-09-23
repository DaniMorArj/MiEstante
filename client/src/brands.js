export const BRAND_MAP = {
  'PlayStation 1': 'Sony',
  'PlayStation 2 Slim': 'Sony',
  'PlayStation 3 Slim': 'Sony',
  'PlayStation 4 Slim (1TB)': 'Sony',
  'PlayStation 4 Slim (500GB)': 'Sony',
  'PlayStation 5 (1TB)': 'Sony',
  'PSP': 'Sony',
  'PS Vita': 'Sony',
  'Game Boy Pocket': 'Nintendo',
  'Game Boy Color': 'Nintendo',
  'PC': 'PC',
};

export const BRAND_LOGOS = {
  Sony: '/logos/sony-brand.svg',
  Nintendo: '/logos/nintendo-brand.png',
  PC: '/logos/pc.png',
};

export const FAMILY_LOGOS = {
  'PlayStation 1': '/logos/ps1.png',
  'PlayStation 2 Slim': '/logos/ps2.svg',
  'PlayStation 3 Slim': '/logos/ps3.svg',
  'PlayStation 4 Slim': '/logos/ps4.svg',
  'PlayStation 5': '/logos/ps5.png',
  'PSP': '/logos/psp.svg',
  'PS Vita': '/logos/vita.svg',
  'Game Boy Pocket': '/logos/gbp.svg',
  'Game Boy Color': '/logos/gbc.svg',
  'PC': '/logos/pc.png',
};

export function brandOf(consola, brandByConsola) {
  if (brandByConsola && brandByConsola[consola]) return brandByConsola[consola];
  return BRAND_MAP[consola] || 'Otros';
}

// Agrupa variantes de una misma consola quitando el sufijo entre paréntesis,
// p.ej. "PlayStation 4 Slim (1TB)" y "(500GB)" -> "PlayStation 4 Slim".
export function familyOf(consola) {
  if (!consola) return consola;
  return consola.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

export function familyLogo(family) {
  return FAMILY_LOGOS[family] || null;
}

export function brandLogo(brand) {
  return BRAND_LOGOS[brand] || null;
}
