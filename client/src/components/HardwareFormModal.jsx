import { useState } from 'react';
import { fileToDataUrl } from '../api';
import { Thumb } from './Badges';

const EMPTY = { consola: '', modelo: '', precio_coste: '', marca: 'Sony', condicion: '', imagen: null, notas: '' };

export default function HardwareFormModal({ initial, marcas, defaultMarca, onSave, onClose }) {
  const editing = Boolean(initial);
  const [form, setForm] = useState(
    initial ? { ...EMPTY, ...initial, condicion: initial.condicion || '' } : { ...EMPTY, marca: defaultMarca || 'Sony' }
  );
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
    if (!form.consola.trim()) {
      setError('Ponle un nombre a la consola.');
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
        <h2>{editing ? 'Ficha de la consola' : 'Añadir consola'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Nombre de la consola</label>
            <input value={form.consola} onChange={set('consola')} readOnly={editing} autoFocus={!editing} />
          </div>

          <div className="field-row">
            <div className="field">
              <label>Modelo</label>
              <input value={form.modelo || ''} onChange={set('modelo')} placeholder="Ej: CUH-2016B" />
            </div>
            <div className="field">
              <label>Precio de coste (€)</label>
              <input type="number" step="0.01" value={form.precio_coste ?? ''} onChange={set('precio_coste')} />
            </div>
          </div>

          <div className="field-row">
            {!editing && (
              <div className="field">
                <label>Marca</label>
                <select value={form.marca} onChange={set('marca')}>
                  {[...new Set([...marcas, 'Sony', 'Nintendo', 'PC', 'Otros'])].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
            <label>Foto (opcional)</label>
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
              placeholder="Accesorios incluidos, dónde la compraste..."
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
