import { brandOf, familyOf } from './brands';

export function getBrands(hardware) {
  const set = new Set();
  hardware.forEach(h => set.add(h.marca || brandOf(h.consola)));
  return Array.from(set);
}

export function getFamilies(hardware, marca) {
  const map = {};
  hardware
    .filter(h => (h.marca || brandOf(h.consola)) === marca)
    .forEach(h => {
      const fam = familyOf(h.consola);
      if (!map[fam]) map[fam] = [];
      map[fam].push(h);
    });
  return Object.entries(map).map(([family, variants]) => ({ family, variants }));
}

export function computeStats(games, hardware) {
  const owned = games.filter(g => g.estado === 'propiedad');
  const wished = games.filter(g => g.estado !== 'propiedad');
  const gastoJuegos = owned.reduce((s, g) => s + (Number(g.precio_coste) || 0), 0);
  const gastoHardware = hardware.reduce((s, h) => s + (Number(h.precio_coste) || 0), 0);
  const valorVenta = owned.reduce((s, g) => s + (Number(g.precio_venta) || 0), 0);

  const porConsolaMap = {};
  owned.forEach(g => {
    if (!g.consola) return;
    if (!porConsolaMap[g.consola]) porConsolaMap[g.consola] = { consola: g.consola, total: 0, gasto: 0 };
    porConsolaMap[g.consola].total += 1;
    porConsolaMap[g.consola].gasto += Number(g.precio_coste) || 0;
  });
  const porConsola = Object.values(porConsolaMap).sort((a, b) => b.total - a.total);

  return {
    totalJuegos: owned.length,
    totalDeseados: wished.length,
    gastoTotal: gastoJuegos + gastoHardware,
    valorVenta,
    porConsola,
  };
}

export function filteredGames(games, ui) {
  const list = games.filter(g => {
    if (ui.activeEstado && g.estado !== ui.activeEstado) return false;
    if (ui.activeConsola && g.consola !== ui.activeConsola) return false;
    if (!ui.activeConsola && ui.activeFamily && familyOf(g.consola) !== ui.activeFamily) return false;
    if (!ui.activeConsola && !ui.activeFamily && ui.marca && brandOf(g.consola) !== ui.marca) return false;
    if (ui.filterCondicion && g.condicion !== ui.filterCondicion) return false;
    if (ui.search) {
      const q = ui.search.toLowerCase();
      const hay = (g.titulo + ' ' + (g.edicion || '')).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const sorters = {
    titulo: (a, b) => (a.consola || '').localeCompare(b.consola || '') || a.titulo.localeCompare(b.titulo),
    titulo_solo: (a, b) => a.titulo.localeCompare(b.titulo),
    precio_asc: (a, b) => (Number(a.precio_coste) || 0) - (Number(b.precio_coste) || 0),
    precio_desc: (a, b) => (Number(b.precio_coste) || 0) - (Number(a.precio_coste) || 0),
  };
  return [...list].sort(sorters[ui.sortBy] || sorters.titulo);
}

export function countForConsola(stats, consola) {
  return stats.porConsola.find(x => x.consola === consola)?.total ?? 0;
}

export function countForFamily(stats, variants) {
  return variants.reduce((s, v) => s + countForConsola(stats, v.consola), 0);
}

export const fmtEUR = (n) => {
  if (n === null || n === undefined || n === '') return '—';
  return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(n) + ' €';
};
