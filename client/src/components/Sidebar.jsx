import { getBrands, getFamilies, countForConsola, countForFamily } from '../selectors';
import { BrandBadge, FamilyBadge } from './Badges';

export default function Sidebar({ ui, setUi, hardware, stats }) {
  const brands = getBrands(hardware);

  const goSection = (section) =>
    setUi({ section, marca: null, activeConsola: null, activeFamily: null, selectedFamily: null, activeEstado: 'propiedad' });

  const selectMarca = (marca) =>
    setUi({ marca, activeConsola: null, activeFamily: null, selectedFamily: null });

  const backMarca = () => setUi({ marca: null, activeConsola: null, activeFamily: null, selectedFamily: null });

  const allOwned = () => setUi({ activeConsola: null, activeFamily: null, activeEstado: 'propiedad' });

  const selectEstado = (estado) => setUi({ activeConsola: null, activeFamily: null, marca: null, activeEstado: estado });

  const selectFamilyVideojuegos = (family, variants) => {
    if (variants.length === 1) setUi({ activeConsola: variants[0].consola, activeFamily: null, activeEstado: 'propiedad' });
    else setUi({ activeConsola: null, activeFamily: family, activeEstado: 'propiedad' });
  };

  const selectFamilyHw = (family) => setUi({ selectedFamily: family });

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        Mi <span>Estante</span>
      </div>

      <div className="section-tabs">
        <button className={`tab ${ui.section === 'videojuegos' ? 'is-active' : ''}`} onClick={() => goSection('videojuegos')}>
          Videojuegos
        </button>
        <button className={`tab ${ui.section === 'consolas' ? 'is-active' : ''}`} onClick={() => goSection('consolas')}>
          Consolas
        </button>
      </div>

      {ui.section === 'videojuegos' ? (
        !ui.marca ? (
          <>
            <ul className="shelf" style={{ flex: 'none' }}>
              <li
                className={`shelf__item ${!ui.activeConsola && !ui.activeFamily && ui.activeEstado === 'propiedad' ? 'is-active' : ''}`}
                onClick={allOwned}
              >
                <span>Todos los juegos</span>
                <span className="shelf__count">{stats.totalJuegos}</span>
              </li>
            </ul>

            <div className="shelf__section-label">POR MARCA</div>
            <ul className="shelf" style={{ flex: 'none' }}>
              {brands.map((b) => (
                <li key={b} className="shelf__item" onClick={() => selectMarca(b)}>
                  <span className="shelf__label-row">
                    <BrandBadge brand={b} />
                    {b}
                  </span>
                </li>
              ))}
            </ul>

            <div className="shelf__section-label">DESEADOS</div>
            <ul className="shelf" style={{ flex: 'none' }}>
              <li
                className={`shelf__item ${ui.activeEstado === 'deseado_nuevo' ? 'is-active' : ''}`}
                onClick={() => selectEstado('deseado_nuevo')}
              >
                <span>Por comprar (nuevo)</span>
              </li>
              <li
                className={`shelf__item ${ui.activeEstado === 'deseado_segunda_mano' ? 'is-active' : ''}`}
                onClick={() => selectEstado('deseado_segunda_mano')}
              >
                <span>Por comprar (2ª mano)</span>
              </li>
            </ul>
          </>
        ) : (
          <>
            <div className="shelf__back" onClick={backMarca}>
              ‹ Todas las marcas
            </div>
            <div className="shelf__section-label">
              <BrandBadge brand={ui.marca} />
              {ui.marca.toUpperCase()}
            </div>
            <ul className="shelf" style={{ flex: 'none' }}>
              <li className={`shelf__item ${!ui.activeConsola && !ui.activeFamily ? 'is-active' : ''}`} onClick={allOwned}>
                <span>Todos de {ui.marca}</span>
              </li>
              {getFamilies(hardware, ui.marca).map(({ family, variants }) => {
                const isActive =
                  (variants.length === 1 && ui.activeConsola === variants[0].consola) || ui.activeFamily === family;
                return (
                  <li
                    key={family}
                    className={`shelf__item ${isActive ? 'is-active' : ''}`}
                    onClick={() => selectFamilyVideojuegos(family, variants)}
                  >
                    <span className="shelf__label-row">
                      <FamilyBadge family={family} />
                      {family}
                    </span>
                    <span className="shelf__count">{countForFamily(stats, variants)}</span>
                  </li>
                );
              })}
            </ul>
          </>
        )
      ) : !ui.marca ? (
        <>
          <div className="shelf__section-label">POR MARCA</div>
          <ul className="shelf" style={{ flex: 'none' }}>
            {brands.map((b) => {
              const count = hardware.filter((h) => (h.marca || b) === b).length;
              return (
                <li key={b} className="shelf__item" onClick={() => selectMarca(b)}>
                  <span className="shelf__label-row">
                    <BrandBadge brand={b} />
                    {b}
                  </span>
                  <span className="shelf__count">{count}</span>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <>
          <div className="shelf__back" onClick={backMarca}>
            ‹ Todas las marcas
          </div>
          <div className="shelf__section-label">
            <BrandBadge brand={ui.marca} />
            {ui.marca.toUpperCase()}
          </div>
          <ul className="shelf" style={{ flex: 'none' }}>
            {getFamilies(hardware, ui.marca).map(({ family }) => (
              <li
                key={family}
                className={`shelf__item ${ui.selectedFamily === family ? 'is-active' : ''}`}
                onClick={() => selectFamilyHw(family)}
              >
                <span className="shelf__label-row">
                  <FamilyBadge family={family} />
                  {family}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </aside>
  );
}
