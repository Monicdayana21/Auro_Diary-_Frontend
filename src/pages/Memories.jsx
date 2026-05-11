import { useState, useEffect } from 'react';
import API, { BASE_URL } from '../api';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

export default function Memories() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', memory_date: new Date().toISOString().split('T')[0] });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [mediaUrl, setMediaUrl] = useState('');

  useEffect(() => { fetchMemories(); }, []);

  const fetchMemories = async () => {
    try { const res = await API.get('/memories'); setMemories(res.data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('content', form.content);
      formData.append('memory_date', form.memory_date);
      
      existingPhotos.forEach(photo => {
        formData.append('existingPhotos', photo);
      });
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      await API.post('/memories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Memory saved! 🌟');
      setShowModal(false);
      setForm({ title: '', content: '', memory_date: new Date().toISOString().split('T')[0] });
      setSelectedFiles([]);
      setExistingPhotos([]);
      fetchMemories();
    } catch (err) { 
      console.error(err);
      toast.error('Error saving memory'); 
    } finally {
      setLoading(false);
    }
  };

  const deleteMemory = async (id) => {
    if (!confirm('Delete this memory?')) return;
    try { await API.delete(`/memories/${id}`); toast.success('Deleted'); fetchMemories(); }
    catch (err) { toast.error('Error'); }
  };

  if (loading) return <div className="page-container"><div style={{display:'flex',justifyContent:'center',padding:60}}><div className="spinner"></div></div></div>;

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Memory Timeline 🕐</h1><p>Your beautiful journey through time</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiPlus /> Add Memory</button>
      </div>

      {memories.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📸</div><h3>No memories yet</h3><p>Start capturing your precious moments</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiPlus /> Add Memory</button></div>
      ) : (
        <div className="timeline">
          {memories.map(m => (
            <div className="timeline-item" key={m.id}>
              <div className="card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="timeline-date">{new Date(m.memory_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
                  <button className="btn-icon" style={{ width: 28, height: 28 }} onClick={() => deleteMemory(m.id)}><FiTrash2 size={12} /></button>
                </div>
                <h3 style={{ fontSize: '1rem', margin: '8px 0 6px' }}>{m.title}</h3>
                {m.photos && m.photos.length > 0 && (
                  <div className="memory-media" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', margin: '12px 0' }}>
                    {m.photos.map((photo, idx) => (
                      <div key={idx} style={{ borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                        {photo.toLowerCase().includes('.mp4') || photo.toLowerCase().includes('.webm') ? (
                          <video src={photo.startsWith('/uploads/') ? `${BASE_URL}${photo}` : photo} controls style={{ width: '100%', height: 'auto', display: 'block' }} />
                        ) : (
                          <img src={photo.startsWith('/uploads/') ? `${BASE_URL}${photo}` : photo} alt="" style={{ width: '100%', height: 'auto', display: 'block' }} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {m.content && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{m.content}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Add Memory</h2><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Title</label><input className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="Memory title..." /></div>
              <div className="form-group"><label>Date</label><input className="form-input" type="date" value={form.memory_date} onChange={e => setForm({...form, memory_date: e.target.value})} /></div>
              <div className="form-group"><label>Description</label><textarea className="form-textarea" value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="Describe this memory..." /></div>
              <div className="form-group">
                <label>Add Media (URL)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="form-input" value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} placeholder="Paste image or video URL..." />
                  <button type="button" className="btn btn-secondary" onClick={() => { if (mediaUrl.trim()) { setExistingPhotos([...existingPhotos, mediaUrl]); setMediaUrl(''); } }}>Add</button>
                </div>
              </div>
              <div className="form-group">
                <label>Upload From Device</label>
                <input type="file" multiple accept="image/*,video/*" onChange={e => setSelectedFiles([...e.target.files])} className="form-input" />
                <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {existingPhotos.map((photo, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '60px', height: '60px' }}>
                      {photo.toLowerCase().includes('.mp4') || photo.toLowerCase().includes('.webm') ? (
                        <video src={photo.startsWith('/uploads/') ? `${BASE_URL}${photo}` : photo} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                      ) : (
                        <img src={photo.startsWith('/uploads/') ? `${BASE_URL}${photo}` : photo} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                      )}
                      <button type="button" onClick={() => setExistingPhotos(existingPhotos.filter((_, i) => i !== idx))} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer' }}>×</button>
                    </div>
                  ))}
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} style={{ width: '60px', height: '60px', background: '#eee', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', textAlign: 'center', padding: '5px' }}>
                      {file.name}
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Memory</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
