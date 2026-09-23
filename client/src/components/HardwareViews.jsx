import { useState } from 'react';
import { getBrands, getFamilies, fmtEUR } from '../selectors';
import { BrandBadge, FamilyBadge, Thumb } from './Badges';
import GameTable from './GameTable';
import { familyOf } from '../brands';

export default function ConsolasView({ ui, setUi, hardware, games, onAddHardware, onEditHardware, onDeleteHardware, onEditGame, onDeleteGame }) {
  const [searchConsolas, setSearchConsolas] = useState('');

  // Vista: marca no elegida -> tarjetas por marca
  if (!ui.marca) {
    const brands = getBrands(hardware);
    return (
      <>
        <h1 className="page-title">Consolas</h1>
        <p className="page-subtitle">Tu hardware, agrupado por marca. Elige una para ver el detalle de cada consola.</p>
        <div className="hw-grid">
          {brands.map((b) => {
            const list = hardware.filter((h) => (h.marca || b) === b);
            const gasto = list.reduce((s, h) => s + (Number(h.precio_coste) || 0), 0);
            return (
              <div key={b} className="hw-card" onClick={() => setUi({ marca: b })}>
                <div className="hw-card__name" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BrandBadge brand={b} />
                  {b}
                </div>
                <div className="hw-card__meta">
                  {list.length} consola{list.length === 1 ? '' : 's'}
                </div>
                <div className="hw-card__price">{fmtEUR(gasto)}</div>
              </div>
            );
          })}
        </div>
      </>
    );
  }

  const familias = getFamilies(hardware, ui.marca);

  // Vista: dentro de una marca sin familia elegida -> grid de familias
  if (!ui.selectedFamily) {
    const filtered = familias.filter(({ family, variants }) => {
      if (!searchConsolas) return true;
      const q = searchConsolas.toLowerCase();
      const hay = (family + ' ' + variants.map((v) => v.modelo || '').join(' ')).toLowerCase();
      return hay.includes(q);
    });

    return (
      <>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BrandBadge brand={ui.marca} />
          {ui.marca}
        </h1>
        <p className="page-subtitle">Consolas de {ui.marca} en tu colección.</p>
        <div className="toolbar">
          <input
            type="search"
            placeholder="Buscar consola o modelo…"
            value={searchConsolas}
            onChange={(e) => setSearchConsolas(e.target.value)}
          />
          <button className="btn btn-primary" onClick={() => onAddHardware(ui.marca)}>
            + Añadir consola
          </button>
        </div>
        <div className="hw-grid">
          {filtered.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              No hay consolas que coincidan con la búsqueda.
            </div>
          )}
          {filtered.map(({ family, variants }) => {
            const gasto = variants.reduce((s, v) => s + (Number(v.precio_coste) || 0), 0);
            const meta = variants.length > 1 ? `${variants.length} modelos` : variants[0].modelo || 'Modelo sin especificar';
            return (
              <div key={family} className="hw-card" onClick={() => setUi({ selectedFamily: family })}>
                <div className="hw-card__name" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FamilyBadge family={family} />
                  {family}
                </div>
                <div className="hw-card__meta">{meta}</div>
                <div className="hw-card__price">{fmtEUR(gasto)}</div>
              </div>
            );
          })}
        </div>
      </>
    );
  }

  // Vista: detalle de una familia (uno o varios modelos)
  const { family, variants } = familias.find((f) => f.family === ui.selectedFamily) || { family: ui.selectedFamily, variants: [] };
  const gamesOfFamily = games.filter((g) => g.estado === 'propiedad' && familyOf(g.consola) === family);
  const gastoJuegos = gamesOfFamily.reduce((s, g) => s + (Number(g.precio_coste) || 0), 0);
  const gastoHardware = variants.reduce((s, v) => s + (Number(v.precio_coste) || 0), 0);

  const verEnVideojuegos = () => {
    if (variants.length === 1) {
      setUi({ section: 'videojuegos', marca: null, activeConsola: variants[0].consola, activeFamily: null, activeEstado: 'propiedad' });
    } else {
      setUi({ section: 'videojuegos', marca: null, activeConsola: null, activeFamily: family, activeEstado: 'propiedad' });
    }
  };

  return (
    <>
      <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <FamilyBadge family={family} />
        {family}
      </h1>
      <p className="page-subtitle">
        {ui.marca}
        {variants.length > 1 ? ` · ${variants.length} modelos en tu colección` : ''}
      </p>

      <div className="stats">
        <div className="stat-card">
          <div className="stat-card__label">Invertido en hardware</div>
          <div className="stat-card__value warm">{fmtEUR(gastoHardware)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Juegos en esta familia</div>
          <div className="stat-card__value">{gamesOfFamily.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Gastado en juegos</div>
          <div className="stat-card__value accent">{fmtEUR(gastoJuegos)}</div>
        </div>
      </div>

      {variants.map((v) => (
        <div className="hw-detail" key={v.id}>
          <Thumb src={v.imagen} size="lg" />
          <div className="hw-detail__field">
            <div className="label">Versión</div>
            <div className="value" style={{ fontFamily: 'var(--font-body)' }}>
              {v.consola}
            </div>
          </div>
          <div className="hw-detail__field">
            <div className="label">Modelo</div>
            <div className="value">{v.modelo || '—'}</div>
          </div>
          <div className="hw-detail__field">
            <div className="label">Precio de coste</div>
            <div className="value">{fmtEUR(v.precio_coste)}</div>
          </div>
          <div className="hw-detail__field">
            <div className="label">Estado</div>
            <div className="value" style={{ fontFamily: 'var(--font-body)' }}>
              {v.condicion === 'nuevo' ? <span className="tag tag-nuevo">Nuevo</span> : v.condicion === 'usado' ? <span className="tag">Usado</span> : '—'}
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <div className="row-actions">
            <button className="btn btn-icon" onClick={() => onEditHardware(v)}>
              Editar
            </button>
            <button className="btn btn-icon btn-danger" onClick={() => onDeleteHardware(v)}>
              Borrar
            </button>
          </div>
        </div>
      ))}

      <div className="toolbar">
        <div style={{ flex: 1 }} />
        <button className="btn" onClick={verEnVideojuegos}>
          Ver estos juegos en Videojuegos →
        </button>
      </div>

      <GameTable games={gamesOfFamily} onEdit={onEditGame} onDelete={onDeleteGame} />
    </>
  );
}
