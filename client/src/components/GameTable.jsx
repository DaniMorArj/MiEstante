import { fmtEUR } from '../selectors';
import { Thumb } from './Badges';

const ESTADO_LABEL = {
  deseado_nuevo: { text: 'Deseado · nuevo', cls: 'tag-wishlist' },
  deseado_segunda_mano: { text: 'Deseado · 2ª mano', cls: 'tag-wishlist-used' },
};

function EstadoCell({ g }) {
  if (g.estado !== 'propiedad') {
    const badge = ESTADO_LABEL[g.estado];
    return badge ? <span className={`tag ${badge.cls}`}>{badge.text}</span> : '—';
  }
  if (g.condicion === 'nuevo') return <span className="tag tag-nuevo">Nuevo</span>;
  if (g.condicion === 'usado') return <span className="tag">Usado</span>;
  return '—';
}

export default function GameTable({ games, onEdit, onDelete }) {
  if (games.length === 0) {
    return (
      <div className="table-wrap">
        <div className="empty-state">No hay juegos que coincidan con este filtro todavía.</div>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Título</th>
            <th>Consola</th>
            <th>Estado</th>
            <th>Coste</th>
            <th>Venta</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {games.slice(0, 200).map((g) => (
            <tr key={g.id}>
              <td>
                <div className="cell-title-wrap" onClick={() => onEdit(g)}>
                  <Thumb src={g.imagen} />
                  <div>
                    <div className="cell-title">{g.titulo}</div>
                    {g.edicion && <div className="cell-edition">{g.edicion}</div>}
                  </div>
                </div>
              </td>
              <td>{g.consola || '—'}</td>
              <td>
                <EstadoCell g={g} />
              </td>
              <td className="cell-price">{fmtEUR(g.precio_coste)}</td>
              <td className="cell-price">{fmtEUR(g.precio_venta)}</td>
              <td>
                <div className="row-actions">
                  <button className="btn btn-icon" onClick={() => onEdit(g)}>
                    Editar
                  </button>
                  <button className="btn btn-icon btn-danger" onClick={() => onDelete(g)}>
                    Borrar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {games.length > 200 && (
        <div className="pager">
          Mostrando 200 de {games.length} resultados — afina la búsqueda para ver más
        </div>
      )}
    </div>
  );
}
