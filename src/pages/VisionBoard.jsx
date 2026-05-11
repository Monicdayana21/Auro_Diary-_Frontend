import { useState, useEffect } from 'react';
import API, { BASE_URL } from '../api';
import { BOARD_CATEGORIES } from '../constants';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

export default function VisionBoard() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'dream_life', items: [] });
  const [itemText, setItemText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [coverUrl, setCoverUrl] = useState('');

  useEffect(() => { fetchBoards(); }, []);

  const fetchBoards = async () => {
    try { const res = await API.get('/boards/vision'); setBoards(res.data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const addItem = () => {
    if (!itemText.trim()) return;
    setForm({ ...form, items: [...form.items, { text: itemText, completed: false }] });
    setItemText('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('items', JSON.stringify(form.items));
      
      if (selectedFile) {
        formData.append('files', selectedFile);
      } else if (coverUrl) {
        formData.append('cover_image', coverUrl);
      }

      await API.post('/boards/vision', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Vision board created! 🎯');
      setShowModal(false);
      setForm({ title: '', description: '', category: 'dream_life', items: [] });
      setSelectedFile(null);
      setCoverUrl('');
      fetchBoards();
    } catch (err) { 
      console.error(err);
      toast.error('Error creating board'); 
    } finally {
      setLoading(false);
    }
  };

  const deleteBoard = async (id) => {
    if (!confirm('Delete this board?')) return;
    try { await API.delete(`/boards/vision/${id}`); toast.success('Deleted'); fetchBoards(); }
    catch (err) { toast.error('Error'); }
  };

  if (loading) return <div className="page-container"><div style={{display:'flex',justifyContent:'center',padding:60}}><div className="spinner"></div></div></div>;

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Vision Board 🎯</h1><p>Visualize your future goals</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiPlus /> New Board</button>
      </div>

      {boards.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🎯</div><h3>No vision boards yet</h3><p>Create your first vision board</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiPlus /> Create Board</button></div>
      ) : (
        <div className="card-grid">
          {boards.map(b => {
            const items = typeof b.items === 'string' ? JSON.parse(b.items) : (b.items || []);
            return (
              <div className="card" key={b.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3>{b.title}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{BOARD_CATEGORIES.find(c => c.value === b.category)?.emoji} {b.category}</p>
                  </div>
                  <button className="btn-icon" onClick={() => deleteBoard(b.id)}><FiTrash2 size={14} /></button>
                </div>
                {b.cover_image && (
                  <div style={{ width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px' }}>
                    <img 
                      src={b.cover_image.startsWith('/uploads/') ? `${BASE_URL}${b.cover_image}` : b.cover_image} 
                      alt="" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                )}
                {b.description && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>{b.description}</p>}
                {items.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem' }}>
                        <span>✦</span>
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 12 }}>{new Date(b.created_at).toLocaleDateString()}</p>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>New Vision Board</h2><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Title</label><input className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="My dream..." required /></div>
              <div className="form-group"><label>Category</label>
                <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  {BOARD_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Description</label>
                <textarea className="form-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe your vision..." style={{ minHeight: 80 }} />
              </div>
              <div className="form-group">
                <label>Cover Image (URL)</label>
                <input className="form-input" value={coverUrl} onChange={e => setCoverUrl(e.target.value)} placeholder="Paste image URL..." />
              </div>
              <div className="form-group">
                <label>Or Upload From Device</label>
                <input type="file" accept="image/*" onChange={e => setSelectedFile(e.target.files[0])} className="form-input" />
              </div>
              <div className="form-group"><label>Goals / Items</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="form-input" value={itemText} onChange={e => setItemText(e.target.value)} placeholder="Add a goal..." onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem(); }}} />
                  <button type="button" className="btn btn-secondary" onClick={addItem}>Add</button>
                </div>
              </div>
              {form.items.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  {form.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.88rem' }}>✦ {item.text}</span>
                      <button type="button" onClick={() => setForm({...form, items: form.items.filter((_, idx) => idx !== i)})} style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer' }}>×</button>
                    </div>
                  ))}
                </div>
              )}
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Board</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
