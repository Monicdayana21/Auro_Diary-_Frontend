import { useState, useEffect } from 'react';
import API from '../api';
import { BOARD_CATEGORIES } from '../constants';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

export default function MoodBoard() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'aesthetic', images: [] });
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => { fetchBoards(); }, []);

  const fetchBoards = async () => {
    try { const res = await API.get('/boards/mood'); setBoards(res.data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const addImage = () => {
    if (!imageUrl.trim()) return;
    setForm({ ...form, images: [...form.images, { url: imageUrl, caption: '' }] });
    setImageUrl('');
  };

  const removeImage = (idx) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('category', form.category);
      formData.append('images', JSON.stringify(form.images));
      
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      await API.post('/boards/mood', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Mood board created! 🎨');
      setShowModal(false);
      setForm({ title: '', category: 'aesthetic', images: [] });
      setSelectedFiles([]);
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
    try { await API.delete(`/boards/mood/${id}`); toast.success('Deleted'); fetchBoards(); }
    catch (err) { toast.error('Error'); }
  };

  if (loading) return <div className="page-container"><div style={{display:'flex',justifyContent:'center',padding:60}}><div className="spinner"></div></div></div>;

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Mood Board 🎨</h1><p>Create aesthetic Pinterest-style boards</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiPlus /> New Board</button>
      </div>

      {boards.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🎨</div><h3>No mood boards yet</h3><p>Create your first aesthetic mood board</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiPlus /> Create Board</button></div>
      ) : (
        <div className="card-grid">
          {boards.map(b => (
            <div className="board-card" key={b.id}>
              <div className="board-cover">
                {b.images && JSON.parse(typeof b.images === 'string' ? b.images : JSON.stringify(b.images)).length > 0
                  ? (
                    <img 
                      src={
                        JSON.parse(typeof b.images === 'string' ? b.images : JSON.stringify(b.images))[0]?.url.startsWith('/uploads/') 
                        ? `http://localhost:5000${JSON.parse(typeof b.images === 'string' ? b.images : JSON.stringify(b.images))[0]?.url}` 
                        : JSON.parse(typeof b.images === 'string' ? b.images : JSON.stringify(b.images))[0]?.url
                      } 
                      alt="" 
                    />
                  )
                  : <span>{BOARD_CATEGORIES.find(c => c.value === b.category)?.emoji || '🎨'}</span>}
              </div>
              <div className="board-info">
                <h3>{b.title}</h3>
                <p className="board-category">{BOARD_CATEGORIES.find(c => c.value === b.category)?.emoji} {b.category}</p>
              </div>
              <div className="board-actions">
                <button className="btn btn-danger btn-sm" onClick={() => deleteBoard(b.id)}><FiTrash2 size={14} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>New Mood Board</h2><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Title</label><input className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Board name..." required /></div>
              <div className="form-group"><label>Category</label>
                <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  {BOARD_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Add Images (URL)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="form-input" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Paste image URL..." />
                  <button type="button" className="btn btn-secondary" onClick={addImage}>Add</button>
                </div>
              </div>
              <div className="form-group">
                <label>Upload From Device</label>
                <input type="file" multiple accept="image/*" onChange={e => setSelectedFiles([...e.target.files])} className="form-input" />
              </div>
              {form.images.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  {form.images.map((img, i) => (
                    <div key={i} style={{ position: 'relative', width: 80, height: 80, borderRadius: 8, overflow: 'hidden' }}>
                      <img src={img.url.startsWith('/uploads/') ? `http://localhost:5000${img.url}` : img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: 2, right: 2, background: 'red', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, fontSize: '0.6rem', cursor: 'pointer' }}>×</button>
                    </div>
                  ))}
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} style={{ width: 80, height: 80, background: '#eee', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', textAlign: 'center', padding: '5px' }}>
                      {file.name}
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
