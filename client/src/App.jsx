import { useEffect, useMemo, useState } from 'react';
import { api } from './api';
import { filteredGames, computeStats } from './selectors';
import { familyOf } from './brands';
import Sidebar from './components/Sidebar.jsx';
import StatsBar from './components/StatsBar.jsx';
import GameTable from './components/GameTable.jsx';
import GameFormModal from './components/GameFormModal.jsx';
import HardwareFormModal from './components/HardwareFormModal.jsx';
import ConsolasView from './components/HardwareViews.jsx';
import Login from './components/Login.jsx';
import { BrandBadge, FamilyBadge } from './components/Badges.jsx';

const INITIAL_UI = {
  section: 'videojuegos',
  marca: null,
  activeConsola: null,
  activeFamily: null,
  activeEstado: 'propiedad',
  selectedFamily: null,
  search: '',
  filterCondicion: '',
  sortBy: 'titulo',
};

export default function App() {
  const [authStatus, setAuthStatus] = useState('checking'); // 'checking' | 'out' | 'in'

  useEffect(() => {
    api
      .me()
      .then((r) => setAuthStatus(r.authenticated ? 'in' : 'out'))
      .catch(() => setAuthStatus('out'));
  }, []);

  if (authStatus === 'checking') return null;
  if (authStatus === 'out') return <Login onLoggedIn={() => setAuthStatus('in')} />;
  return <Collection onLoggedOut={() => setAuthStatus('out')} />;
}

function Collection({ onLoggedOut }) {
  const [games, setGames] = useState([]);
  const [hardware, setHardware] = useState([]);
  const [consolas, setConsolas] = useState([]);
  const [marcas, setMarcas] = useState([]);

  const [ui, setUiState] = useState(INITIAL_UI);
  const setUi = (patch) => setUiState((prev) => ({ ...prev, ...patch }));

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [gameModal, setGameModal] = useState(undefined); // { game } | {} = abierto, undefined = cerrado
  const [hwModal, setHwModal] = useState(undefined);
  const [loadError, setLoadError] = useState(null);

  const loadAll = async () => {
    try {
      const [g, h, c, m] = await Promise.all([api.getGames(), api.getHardware(), api.getConsolas(), api.getMarcas()]);
      setGames(g);
      setHardware(h);
      setConsolas(c);
      setMarcas(m);
      setLoadError(null);
    } catch (err) {
      if (err.status === 401) {
        onLoggedOut();
        return;
      }
      setLoadError(err.message);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const stats = useMemo(() => computeStats(games, hardware), [games, hardware]);
  const visibleGames = useMemo(() => filteredGames(games, ui), [games, ui]);

  // ---------- Juegos ----------

  const handleSaveGame = async (form) => {
    if (gameModal?.game) {
      await api.updateGame(gameModal.game.id, form);
    } else {
      await api.createGame(form);
    }
    setGameModal(undefined);
    await loadAll();
  };

  const handleDeleteGame = async (game) => {
    if (!confirm(`¿Borrar "${game.titulo}" de la colección?`)) return;
    await api.deleteGame(game.id);
    await loadAll();
  };

  // ---------- Hardware ----------

  const handleSaveHardware = async (form) => {
    if (hwModal?.hardware) {
      await api.updateHardware(hwModal.hardware.id, form);
    } else {
      await api.createHardware(form);
    }
    setHwModal(undefined);
    await loadAll();
  };

  const handleDeleteHardware = async (hw) => {
    if (!confirm(`¿Borrar "${hw.consola}" de tu hardware? (esto no borra sus juegos)`)) return;
    await api.deleteHardware(hw.id);
    if (getFamiliesLeft(hw) === 0) setUi({ selectedFamily: null });
    await loadAll();
  };

  const getFamiliesLeft = (hw) => hardware.filter((h) => h.id !== hw.id && familyOf(h.consola) === familyOf(hw.consola)).length;

  const handleLogout = async () => {
    try {
      await api.logout();
    } finally {
      onLoggedOut();
    }
  };

  // ---------- Cabecera ----------

  const heading = () => {
    if (ui.section === 'consolas') {
      if (ui.selectedFamily) return ui.selectedFamily;
      return ui.marca ? `Consolas · ${ui.marca}` : 'Consolas';
    }
    if (ui.activeEstado === 'deseado_nuevo') return 'Lista de deseos · nuevo';
    if (ui.activeEstado === 'deseado_segunda_mano') return 'Lista de deseos · segunda mano';
    if (ui.activeConsola) return ui.activeConsola;
    if (ui.activeFamily) return ui.activeFamily;
    if (ui.marca) return `Videojuegos · ${ui.marca}`;
    return 'Toda la colección';
  };

  const headingBadge = () => {
    if (ui.section !== 'videojuegos') return null;
    if (ui.activeConsola) return <FamilyBadge family={familyOf(ui.activeConsola)} />;
    if (ui.activeFamily) return <FamilyBadge family={ui.activeFamily} />;
    return null;
  };

  return (
    <div className="app">
      <div className="mobile-topbar">
        <button className="hamburger-btn" onClick={() => setMobileMenuOpen(true)} aria-label="Abrir menú">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        <div className="mobile-topbar__brand">
          Mi <span>Estante</span>
        </div>
      </div>

      <Sidebar
        ui={ui}
        setUi={setUi}
        hardware={hardware}
        stats={stats}
        onLogout={handleLogout}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <main className="main">
        {ui.section === 'consolas' ? (
          <ConsolasView
            ui={ui}
            setUi={setUi}
            hardware={hardware}
            games={games}
            onAddHardware={(marca) => setHwModal({ marca })}
            onEditHardware={(hw) => setHwModal({ hardware: hw })}
            onDeleteHardware={handleDeleteHardware}
            onEditGame={(g) => setGameModal({ game: g })}
            onDeleteGame={handleDeleteGame}
          />
        ) : (
          <>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {headingBadge()}
              {heading()}
            </h1>
            <p className="page-subtitle">Control de stock e inventario de tu colección de videojuegos y consolas.</p>

            <StatsBar stats={stats} />

            <div className="toolbar">
              <input
                type="search"
                placeholder="Buscar por título o edición…"
                value={ui.search}
                onChange={(e) => setUi({ search: e.target.value })}
              />
              <select value={ui.filterCondicion} onChange={(e) => setUi({ filterCondicion: e.target.value })}>
                <option value="">Estado: todos</option>
                <option value="nuevo">Estado: nuevo</option>
                <option value="usado">Estado: usado</option>
              </select>
              <select value={ui.sortBy} onChange={(e) => setUi({ sortBy: e.target.value })}>
                <option value="titulo">Ordenar: consola</option>
                <option value="titulo_solo">Ordenar: título A-Z</option>
                <option value="precio_asc">Ordenar: precio ↑</option>
                <option value="precio_desc">Ordenar: precio ↓</option>
              </select>
              <button className="btn btn-primary" onClick={() => setGameModal({})}>
                + Añadir juego
              </button>
            </div>

            {loadError && <div className="error-text">{loadError}</div>}

            <GameTable games={visibleGames} onEdit={(g) => setGameModal({ game: g })} onDelete={handleDeleteGame} />
          </>
        )}
      </main>

      {gameModal !== undefined && (
        <GameFormModal
          initial={gameModal?.game}
          consolas={consolas}
          onSave={handleSaveGame}
          onClose={() => setGameModal(undefined)}
        />
      )}

      {hwModal !== undefined && (
        <HardwareFormModal
          initial={hwModal?.hardware}
          marcas={marcas}
          defaultMarca={hwModal?.marca}
          onSave={handleSaveHardware}
          onClose={() => setHwModal(undefined)}
        />
      )}
    </div>
  );
}
