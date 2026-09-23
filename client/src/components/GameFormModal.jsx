import { useState } from 'react';
import { fileToDataUrl } from '../api';
import { Thumb } from './Badges';

const EMPTY = {
  titulo: '',
  consola: '',
  edicion: '',
  precio_coste: '',
  precio_venta: '',
  estado: 'propiedad',
  condicion: '',
  imagen: null,
  notas: '',
};

export default function GameFormModal({ initial, consolas, onSave, onClose }) {
  const [form, setForm] = useState(initial ? { ...EMPTY, ...initial, condicion: initial.condicion || '' } : EMPTY);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const dataUrl = await fileToDataUrl(file);
      setForm((f) => ({ ...f, imagen: dataUrl }));
    } catch (err) {
      setError('No se pudo leer la imagen: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.titulo.trim()) {
      setError('Ponle un título al juego.');
      return;
    }
    setSaving(true);
    try {
      await onSave({ ...form, condicion: form.condicion || null });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{initial ? 'Ficha del juego' : 'Añadir juego'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Título</label>
            <input value={form.titulo} onChange={set('titulo')} autoFocus />
          </div>

          <div className="field-row">
            <div className="field">
              <label>Consola</label>
              <input list="consolas-list" value={form.consola || ''} onChange={set('consola')} />
              <datalist id="consolas-list">
                {consolas.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="field">
              <label>Edición</label>
              <input value={form.edicion || ''} onChange={set('edicion')} placeholder="Ej: GOTY, Platinum..." />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Precio de coste (€)</label>
              <input type="number" step="0.01" value={form.precio_coste ?? ''} onChange={set('precio_coste')} />
            </div>
            <div className="field">
              <label>Precio de venta (€)</label>
              <input type="number" step="0.01" value={form.precio_venta ?? ''} onChange={set('precio_venta')} />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Disponibilidad</label>
              <select value={form.estado} onChange={set('estado')}>
                <option value="propiedad">En propiedad</option>
                <option value="deseado_nuevo">Deseado · nuevo</option>
                <option value="deseado_segunda_mano">Deseado · 2ª mano</option>
              </select>
            </div>
            <div className="field">
              <label>Estado</label>
              <select value={form.condicion || ''} onChange={set('condicion')}>
                <option value="">Sin especificar</option>
                <option value="nuevo">Nuevo</option>
                <option value="usado">Usado</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label>Carátula (opcional)</label>
            <div className="img-field">
              <Thumb src={form.imagen} size="lg" />
              <div>
                <input type="file" accept="image/*" onChange={handleImageChange} disabled={uploading} />
                {uploading && <div className="cell-edition">Procesando imagen…</div>}
                {form.imagen && (
                  <button type="button" className="btn btn-icon" style={{ marginTop: 6 }} onClick={() => setForm((f) => ({ ...f, imagen: null }))}>
                    Quitar
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="field">
            <label>Notas</label>
            <textarea
              rows={2}
              value={form.notas || ''}
              onChange={set('notas')}
              placeholder="Estado de la caja, si está firmado, dónde lo compraste..."
            />
          </div>

          {error && <div className="error-text">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
