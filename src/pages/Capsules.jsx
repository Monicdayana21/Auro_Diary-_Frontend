import { useState, useEffect } from 'react';
import API from '../api';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiLock, FiUnlock } from 'react-icons/fi';

export default function Capsules() {
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', unlock_date: '' });

  useEffect(() => { fetchCapsules(); }, []);

  const fetchCapsules = async () => {
    try { const res = await API.get('/memories/capsules'); setCapsules(res.data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/memories/capsules', form);
      toast.success('Time capsule created! ⏳');
      setShowModal(false);
      setForm({ title: '', content: '', unlock_date: '' });
      fetchCapsules();
    } catch (err) { toast.error('Error creating capsule'); }
  };

  const openCapsule = async (id) => {
    try {
      const res = await API.put(`/memories/capsules/${id}/open`);
      toast.success('Capsule opened! 🎉');
      fetchCapsules();
    } catch (err) { toast.error(err.response?.data?.error || 'Cannot open yet'); }
  };

  const deleteCapsule = async (id) => {
    if (!confirm('Delete this capsule?')) return;
    try { await API.delete(`/memories/capsules/${id}`); toast.success('Deleted'); fetchCapsules(); }
    catch (err) { toast.error('Error'); }
  };

  const isReady = (date) => new Date(date) <= new Date();

  if (loading) return <div className="page-container"><div style={{display:'flex',justifyContent:'center',padding:60}}><div className="spinner"></div></div></div>;

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Memory Capsules ⏳</h1><p>Write notes to your future self</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiPlus /> New Capsule</button>
      </div>

      {capsules.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">💌</div><h3>No capsules yet</h3><p>Write a letter to your future self</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiPlus /> Create Capsule</button></div>
      ) : (
        <div className="card-grid">
          {capsules.map(c => (
            <div className={`capsule-card ${!c.is_opened && !isReady(c.unlock_date) ? 'locked' : ''}`} key={c.id}>
              <div className="capsule-lock">{c.is_opened ? '📖' : isReady(c.unlock_date) ? '🔓' : '🔒'}</div>
              <h3>{c.title}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '8px 0' }}>
                {c.is_opened ? 'Opened' : `Unlocks ${new Date(c.unlock_date).toLocaleDateString()}`}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Created {new Date(c.created_at).toLocaleDateString()}</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                {!c.is_opened && isReady(c.unlock_date) && (
                  <button className="btn btn-primary btn-sm" onClick={() => openCapsule(c.id)}><FiUnlock size={14} /> Open</button>
                )}
                <button className="btn btn-danger btn-sm" onClick={() => deleteCapsule(c.id)}><FiTrash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>New Memory Capsule</h2><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Title</label><input className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="Dear future me..." /></div>
              <div className="form-group"><label>Message to your future self</label><textarea className="form-textarea" value={form.content} onChange={e => setForm({...form, content: e.target.value})} required placeholder="Write something meaningful..." style={{ minHeight: 150 }} /></div>
              <div className="form-group"><label>Unlock Date</label><input className="form-input" type="date" value={form.unlock_date} onChange={e => setForm({...form, unlock_date: e.target.value})} required min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} /></div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Seal Capsule ✨</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
