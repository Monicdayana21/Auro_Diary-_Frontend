import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API, { BASE_URL } from '../api';
import { MOODS } from '../constants';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const res = await API.get('/dashboard');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-container"><div style={{display:'flex',justifyContent:'center',padding:'60px'}}><div className="spinner"></div></div></div>;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>{greeting()}, {user?.name?.split(' ')[0]} ✨</h1>
          <p>Here's your Aura Diary overview</p>
        </div>
        <div 
          onClick={() => navigate('/settings')}
          style={{ 
            width: 60, 
            height: 60, 
            borderRadius: '50%', 
            overflow: 'hidden', 
            border: '3px solid var(--glass)', 
            boxShadow: '0 4px 15px var(--shadow)',
            cursor: 'pointer',
            background: 'var(--card-bg)'
          }}
        >
          {user?.avatar ? (
            <img 
              src={user.avatar.startsWith('/uploads/') ? `${BASE_URL}${user.avatar}` : user.avatar} 
              alt="" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>
              {user?.name?.charAt(0) || '👤'}
            </div>
          )}
        </div>
      </div>

      {data?.dailyQuote && (
        <div className="card" style={{ marginBottom: 24, background: 'var(--accent-light)', borderLeft: '4px solid var(--accent)' }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '1rem', marginBottom: 6 }}>"{data.dailyQuote.text}"</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 500 }}>— {data.dailyQuote.author}</p>
        </div>
      )}

      <div className="stat-grid">
        {[
          { icon: '📝', value: data?.stats?.journals || 0, label: 'Journal Entries', path: '/journal' },
          { icon: '😊', value: data?.stats?.moods || 0, label: 'Mood Logs', path: '/mood' },
          { icon: '💬', value: data?.stats?.quotes || 0, label: 'Quotes Saved', path: '/quotes' },
          { icon: '🎯', value: data?.stats?.visionBoards || 0, label: 'Vision Boards', path: '/vision-board' },
          { icon: '🎨', value: data?.stats?.moodBoards || 0, label: 'Mood Boards', path: '/mood-board' },
          { icon: '🔥', value: data?.stats?.streak || 0, label: 'Day Streak', path: '/mood' },
        ].map((s, i) => (
          <div className="stat-card" key={i} onClick={() => navigate(s.path)} style={{ cursor: 'pointer' }}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {data?.todayMood ? (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 8 }}>Today's Mood</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '2.5rem' }}>{data.todayMood.emoji}</span>
            <div>
              <p style={{ fontWeight: 600, textTransform: 'capitalize' }}>{data.todayMood.mood}</p>
              {data.todayMood.note && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{data.todayMood.note}</p>}
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: 24, textAlign: 'center', padding: 30 }}>
          <p style={{ fontSize: '2rem', marginBottom: 8 }}>🌟</p>
          <h3>How are you feeling today?</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 16 }}>Log your mood to track your emotional journey</p>
          <button className="btn btn-primary" onClick={() => navigate('/mood')}>Log Mood</button>
        </div>
      )}

      {data?.recentJournals?.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.2rem' }}>Recent Journals</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/journal')}>View All</button>
          </div>
          <div className="card-grid">
            {data.recentJournals.map((j) => (
              <div className="journal-card" key={j.id} onClick={() => navigate('/journal')}>
                <div className="journal-header">
                  <span className="journal-mood">{j.emoji}</span>
                  <span className="journal-date">{new Date(j.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
                <h3>{j.title}</h3>
                {j.photos && j.photos.length > 0 && (
                  <div style={{ height: '60px', borderRadius: '4px', overflow: 'hidden', margin: '8px 0' }}>
                    <img 
                      src={j.photos[0].startsWith('/uploads/') ? `${BASE_URL}${j.photos[0]}` : j.photos[0]} 
                      alt="" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                )}
                <div className="journal-footer">
                  <span className="tag">{j.mood}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
