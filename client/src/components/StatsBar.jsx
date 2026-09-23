const fmt = (n) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0);

export default function StatsBar({ stats }) {
  if (!stats) return null;
  return (
    <div className="stats">
      <div className="stat-card">
        <div className="stat-card__label">Juegos en propiedad</div>
        <div className="stat-card__value">{stats.totalJuegos}</div>
      </div>
      <div className="stat-card">
        <div className="stat-card__label">Gasto total (juegos + hardware)</div>
        <div className="stat-card__value warm">{fmt(stats.gastoTotal)}</div>
      </div>
      <div className="stat-card">
        <div className="stat-card__label">Valor estimado de reventa</div>
        <div className="stat-card__value accent">{fmt(stats.valorVenta)}</div>
      </div>
      <div className="stat-card">
        <div className="stat-card__label">En lista de deseos</div>
        <div className="stat-card__value">{stats.totalDeseados}</div>
      </div>
    </div>
  );
}
