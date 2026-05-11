import { useState, useEffect } from 'react';
import API from '../api';
import { QUOTE_CATEGORIES } from '../constants';
import toast from 'react-hot-toast';
import { FiPlus, FiHeart, FiTrash2, FiSearch } from 'react-icons/fi';

export default function Quotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [form, setForm] = useState({ text: '', author: '', category: 'motivation' });
  const [activeTab, setActiveTab] = useState('my_quotes'); // 'my_quotes' or 'explore'
  const [exploreMood, setExploreMood] = useState('motivation');

  const SUGGESTED_QUOTES = {
    motivation: [
      { text: "Your limitation—it’s only your imagination.", author: "Unknown" },
      { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
      { text: "Great things never come from comfort zones.", author: "Unknown" },
      { text: "Success doesn’t just find you. You have to go out and get it.", author: "Unknown" },
      { text: "The harder you work for something, the greater you’ll feel when you achieve it.", author: "Unknown" }
    ],
    calm: [
      { text: "Within you, there is a stillness and a sanctuary to which you can retreat at any time and be yourself.", author: "Hermann Hesse" },
      { text: "Quiet the mind and the soul will speak.", author: "Ma Jaya Sati Bhagavati" },
      { text: "Peace is a daily, a weekly, a monthly process, gradually changing opinions, slowly eroding old barriers, quietly building new structures.", author: "John F. Kennedy" },
      { text: "Breathe. It’s only a bad day, not a bad life.", author: "Johnny Depp" },
      { text: "Don’t let the behavior of others destroy your inner peace.", author: "Dalai Lama" }
    ],
    happy: [
      { text: "Happiness is not something readymade. It comes from your own actions.", author: "Dalai Lama" },
      { text: "The most important thing is to enjoy your life—to be happy—it's all that matters.", author: "Audrey Hepburn" },
      { text: "For every minute you are angry you lose sixty seconds of happiness.", author: "Ralph Waldo Emerson" },
      { text: "Happiness depends upon ourselves.", author: "Aristotle" },
      { text: "The purpose of our lives is to be happy.", author: "Dalai Lama" }
    ],
    healing: [
      { text: "The soul always knows what to do to heal itself. The challenge is to silence the mind.", author: "Caroline Myss" },
      { text: "Healing takes courage, and we all have courage, even if we have to dig a little to find it.", author: "Tori Amos" },
      { text: "Every day is a second chance.", author: "Unknown" },
      { text: "You have power over your mind—not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
      { text: "Healing is an art. It takes time, it takes practice. It takes love.", author: "Maza Dohta" }
    ],
    dream_life: [
      { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
      { text: "Go confidently in the direction of your dreams! Live the life you’ve imagined.", author: "Henry David Thoreau" },
      { text: "A dream you dream alone is only a dream. A dream you dream together is reality.", author: "Yoko Ono" },
      { text: "Don't tell people your dreams. Show them.", author: "Unknown" },
      { text: "Believe in your dreams and they may come true; believe in yourself and they will come true.", author: "Unknown" }
    ],
    wisdom: [
      { text: "The only true wisdom is in knowing you know nothing.", author: "Socrates" },
      { text: "In the end, it's not the years in your life that count. It's the life in your years.", author: "Abraham Lincoln" },
      { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
      { text: "Knowing yourself is the beginning of all wisdom.", author: "Aristotle" }
    ],
    success: [
      { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
      { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
      { text: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson" }
    ],
    love: [
      { text: "Love all, trust a few, do wrong to none.", author: "William Shakespeare" },
      { text: "The best thing to hold onto in life is each other.", author: "Audrey Hepburn" },
      { text: "Where there is love there is life.", author: "Mahatma Gandhi" }
    ]
  };

  useEffect(() => { fetchQuotes(); }, [search, filterCat]);

  const fetchQuotes = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (filterCat) params.category = filterCat;
      const res = await API.get('/quotes', { params });
      setQuotes(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/quotes', form);
      toast.success('Quote saved! 💬');
      setShowModal(false);
      setForm({ text: '', author: '', category: 'motivation' });
      fetchQuotes();
    } catch (err) { toast.error('Error saving quote'); }
  };

  const toggleFavorite = async (q) => {
    try {
      await API.put(`/quotes/${q.id}`, { is_favorite: !q.is_favorite });
      fetchQuotes();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this quote?')) return;
    try { await API.delete(`/quotes/${id}`); toast.success('Deleted'); fetchQuotes(); }
    catch (err) { toast.error('Error'); }
  };

  const saveSuggested = async (sq) => {
    try {
      await API.post('/quotes', { text: sq.text, author: sq.author, category: exploreMood });
      toast.success('Quote added to your collection! ✨');
      fetchQuotes();
    } catch (err) { toast.error('Error saving quote'); }
  };

  const bgColors = ['#fce4ec', '#e8eaf6', '#e0f2f1', '#fff3e0', '#f3e5f5', '#e1f5fe', '#fff8e1', '#f1f8e9'];

  if (loading) return <div className="page-container"><div style={{display:'flex',justifyContent:'center',padding:60}}><div className="spinner"></div></div></div>;

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Quotes Gallery 💬</h1><p>Your collection of inspiration</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiPlus /> Add Quote</button>
      </div>

      <div className="chip-group" style={{ marginBottom: 30 }}>
        <button className={`chip ${activeTab === 'my_quotes' ? 'active' : ''}`} onClick={() => setActiveTab('my_quotes')}>My Collection</button>
        <button className={`chip ${activeTab === 'explore' ? 'active' : ''}`} onClick={() => setActiveTab('explore')}>Explore Moods ✨</button>
      </div>

      {activeTab === 'explore' ? (
        <div className="explore-section">
          <div className="mood-selector" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
            {QUOTE_CATEGORIES.map(c => (
              <button 
                key={c.value} 
                className={`btn ${exploreMood === c.value ? 'btn-primary' : 'btn-ghost'}`} 
                onClick={() => setExploreMood(c.value)}
                style={{ borderRadius: 20, padding: '8px 20px', fontSize: '0.85rem' }}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>

          <div className="card-grid">
            {(SUGGESTED_QUOTES[exploreMood] || []).map((sq, i) => (
              <div className="quote-card explore-card" key={i} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', position: 'relative' }}>
                <p className="quote-text">"{sq.text}"</p>
                <p className="quote-author">— {sq.author}</p>
                <button className="btn btn-primary btn-sm" style={{ marginTop: 15, width: '100%' }} onClick={() => saveSuggested(sq)}>
                  <FiHeart style={{ marginRight: 6 }} /> Save to Collection
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="search-bar">
            <FiSearch style={{ color: 'var(--text-secondary)' }} />
            <input placeholder="Search my quotes..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div className="chip-group">
            <button className={`chip ${filterCat === '' ? 'active' : ''}`} onClick={() => setFilterCat('')}>All</button>
            {QUOTE_CATEGORIES.map(c => (
              <button key={c.value} className={`chip ${filterCat === c.value ? 'active' : ''}`} onClick={() => setFilterCat(c.value)}>
                {c.emoji} {c.label}
              </button>
            ))}
          </div>

          {quotes.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">💭</div><h3>No quotes yet</h3><p>Start saving your favorite quotes or explore new ones</p>
              <button className="btn btn-primary" onClick={() => setActiveTab('explore')}><FiSearch /> Explore Quotes</button>
            </div>
          ) : (
            <div className="card-grid">
              {quotes.map((q, i) => (
                <div className="quote-card" key={q.id} style={{ background: q.bg_color || bgColors[i % bgColors.length] }}>
                  <button className="quote-fav" onClick={() => toggleFavorite(q)}>
                    <FiHeart fill={q.is_favorite ? '#e91e63' : 'none'} color={q.is_favorite ? '#e91e63' : 'var(--text-secondary)'} />
                  </button>
                  <p className="quote-text">"{q.text}"</p>
                  <p className="quote-author">— {q.author}</p>
                  <div className="quote-actions">
                    <span className="tag">{QUOTE_CATEGORIES.find(c => c.value === q.category)?.emoji} {q.category}</span>
                    <button className="btn-icon" style={{ marginLeft: 'auto', width: 30, height: 30 }} onClick={() => handleDelete(q.id)}><FiTrash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Quote</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Quote</label>
                <textarea className="form-textarea" value={form.text} onChange={e => setForm({...form, text: e.target.value})} placeholder="Enter the quote..." required />
              </div>
              <div className="form-group">
                <label>Author</label>
                <input className="form-input" value={form.author} onChange={e => setForm({...form, author: e.target.value})} placeholder="Who said this?" />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  {QUOTE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Quote</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
