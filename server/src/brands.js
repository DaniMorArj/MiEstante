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

export function brandOf(consola) {
  return BRAND_MAP[consola] || 'Otros';
}
