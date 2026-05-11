import { useState, useEffect } from 'react';
import API from '../api';
import { DREAM_TYPES, MOODS } from '../constants';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

export default function Dreams() {
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', dream_type: 'normal', mood: 'neutral', date: new Date().toISOString().split('T')[0] });

  useEffect(() => { fetchDreams(); }, []);

  const fetchDreams = async () => {
    try { const res = await API.get('/memories/dreams'); setDreams(res.data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/memories/dreams', form);
      toast.success('Dream logged! 💭');
      setShowModal(false);
      setForm({ title: '', description: '', dream_type: 'normal', mood: 'neutral', date: new Date().toISOString().split('T')[0] });
      fetchDreams();
    } catch (err) { toast.error('Error saving dream'); }
  };

  const deleteDream = async (id) => {
    if (!confirm('Delete this dream?')) return;
    try { await API.delete(`/memories/dreams/${id}`); toast.success('Deleted'); fetchDreams(); }
    catch (err) { toast.error('Error'); }
  };

  if (loading) return <div className="page-container"><div style={{display:'flex',justifyContent:'center',padding:60}}><div className="spinner"></div></div></div>;

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Dream Tracker 🌙</h1><p>Record and explore your dreams</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiPlus /> Log Dream</button>
      </div>

      {dreams.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🌙</div><h3>No dreams recorded</h3><p>Start logging your dreams to find patterns</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiPlus /> Log Dream</button></div>
      ) : (
        <div className="card-grid">
          {dreams.map(d => (
            <div className="card" key={d.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '1.3rem' }}>{DREAM_TYPES.find(t => t.value === d.dream_type)?.emoji || '💭'}</span>
                  <h3 style={{ marginTop: 6 }}>{d.title}</h3>
                </div>
                <button className="btn-icon" style={{ width: 28, height: 28 }} onClick={() => deleteDream(d.id)}><FiTrash2 size={12} /></button>
              </div>
              {d.description && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.5 }}>{d.description}</p>}
              <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                <span className="tag">{d.dream_type}</span>
                <span className="tag">{d.mood}</span>
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 8 }}>{new Date(d.date).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Log a Dream</h2><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Dream Title</label><input className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="What was your dream about?" /></div>
              <div className="form-group"><label>Dream Type</label>
                <select className="form-select" value={form.dream_type} onChange={e => setForm({...form, dream_type: e.target.value})}>
                  {DREAM_TYPES.map(t => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Mood in Dream</label>
                <select className="form-select" value={form.mood} onChange={e => setForm({...form, mood: e.target.value})}>
                  <option value="neutral">Neutral</option>
                  {MOODS.map(m => <option key={m.name} value={m.name}>{m.emoji} {m.label}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Date</label><input className="form-input" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
              <div className="form-group"><label>Description</label><textarea className="form-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe your dream in detail..." style={{ minHeight: 120 }} /></div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Dream</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
