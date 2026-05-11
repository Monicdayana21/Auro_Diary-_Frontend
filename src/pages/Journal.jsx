import { useState, useEffect } from 'react';
import API from '../api';
import { MOODS } from '../constants';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiHeart, FiTrash2, FiEdit3 } from 'react-icons/fi';

export default function Journal() {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterMood, setFilterMood] = useState('');
  const [form, setForm] = useState({ title: '', content: '', mood: 'calm', emoji: '😌' });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [mediaUrl, setMediaUrl] = useState('');

  useEffect(() => { fetchJournals(); }, [search, filterMood]);

  const fetchJournals = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (filterMood) params.mood = filterMood;
      const res = await API.get('/journals', { params });
      setJournals(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('content', form.content);
      formData.append('mood', form.mood);
      formData.append('emoji', form.emoji);
      
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      if (editingId) {
        existingPhotos.forEach(photo => {
          formData.append('existingPhotos', photo);
        });
        await API.put(`/journals/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Journal updated ✨');
      } else {
        await API.post('/journals', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Journal saved 🌸');
      }
      setShowModal(false);
      setEditingId(null);
      setForm({ title: '', content: '', mood: 'calm', emoji: '😌' });
      setSelectedFiles([]);
      setExistingPhotos([]);
      fetchJournals();
    } catch (err) { 
      console.error(err);
      toast.error(err.response?.data?.error || 'Error saving'); 
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (j) => {
    setForm({ title: j.title, content: j.content, mood: j.mood, emoji: j.emoji });
    setEditingId(j.id);
    setExistingPhotos(j.photos || []);
    setSelectedFiles([]);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this journal entry?')) return;
    try {
      await API.delete(`/journals/${id}`);
      toast.success('Deleted');
      fetchJournals();
    } catch (err) { toast.error('Error deleting'); }
  };

  const toggleFavorite = async (j) => {
    try {
      await API.put(`/journals/${j.id}`, { is_favorite: !j.is_favorite });
      fetchJournals();
    } catch (err) { console.error(err); }
  };

  const selectMood = (m) => setForm({ ...form, mood: m.name, emoji: m.emoji });

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>My Journal 📝</h1><p>Express your thoughts freely</p></div>
        <button className="btn btn-primary" onClick={() => { setForm({ title: '', content: '', mood: 'calm', emoji: '😌' }); setEditingId(null); setSelectedFiles([]); setExistingPhotos([]); setShowModal(true); }}>
          <FiPlus /> New Entry
        </button>
      </div>

      <div className="search-bar">
        <FiSearch style={{ color: 'var(--text-secondary)' }} />
        <input placeholder="Search journals..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="chip-group">
        <button className={`chip ${filterMood === '' ? 'active' : ''}`} onClick={() => setFilterMood('')}>All</button>
        {MOODS.slice(0, 6).map(m => (
          <button key={m.name} className={`chip ${filterMood === m.name ? 'active' : ''}`} onClick={() => setFilterMood(m.name)}>
            {m.emoji} {m.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner"></div></div>
      ) : journals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📖</div>
          <h3>No journal entries yet</h3>
          <p>Start writing your first journal entry</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiPlus /> Write Now</button>
        </div>
      ) : (
        <div className="card-grid">
          {journals.map(j => (
            <div className="journal-card" key={j.id}>
              <div className="journal-header">
                <span className="journal-mood">{j.emoji}</span>
                <span className="journal-date">{new Date(j.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <h3>{j.title}</h3>
              {j.photos && j.photos.length > 0 && (
                <div className="journal-media" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px', margin: '10px 0' }}>
                  {j.photos.map((photo, idx) => (
                    <div key={idx} style={{ height: '80px', borderRadius: '8px', overflow: 'hidden' }}>
                      {photo.toLowerCase().includes('.mp4') || photo.toLowerCase().includes('.webm') ? (
                        <video src={photo.startsWith('/uploads/') ? `http://localhost:5000${photo}` : photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <img src={photo.startsWith('/uploads/') ? `http://localhost:5000${photo}` : photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                    </div>
                  ))}
                </div>
              )}
              <p>{j.content}</p>
              <div className="journal-footer">
                <div className="journal-tags"><span className="tag">{j.mood}</span></div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn-icon" onClick={() => toggleFavorite(j)} style={{ color: j.is_favorite ? '#e91e63' : undefined }}>
                    <FiHeart fill={j.is_favorite ? '#e91e63' : 'none'} />
                  </button>
                  <button className="btn-icon" onClick={() => handleEdit(j)}><FiEdit3 /></button>
                  <button className="btn-icon" onClick={() => handleDelete(j.id)}><FiTrash2 /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Journal' : 'New Journal Entry'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Give your entry a title..." required />
              </div>
              <div className="form-group">
                <label>How are you feeling?</label>
                <div className="mood-grid">
                  {MOODS.map(m => (
                    <div key={m.name} className={`mood-option ${form.mood === m.name ? 'selected' : ''}`} onClick={() => selectMood(m)}>
                      <span className="mood-emoji">{m.emoji}</span>
                      <span className="mood-label">{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Your thoughts</label>
                <textarea className="form-textarea" value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="Write your heart out..." required style={{ minHeight: 180 }} />
              </div>
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
                        <video src={photo.startsWith('/uploads/') ? `http://localhost:5000${photo}` : photo} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                      ) : (
                        <img src={photo.startsWith('/uploads/') ? `http://localhost:5000${photo}` : photo} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
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
                <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Save Entry'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
