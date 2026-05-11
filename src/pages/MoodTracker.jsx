import { useState, useEffect } from 'react';
import API from '../api';
import { MOODS } from '../constants';
import toast from 'react-hot-toast';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function MoodTracker() {
  const [moods, setMoods] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedMood, setSelectedMood] = useState('');
  const [note, setNote] = useState('');
  const [energy, setEnergy] = useState(5);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('log');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [moodsRes, analyticsRes] = await Promise.all([
        API.get('/moods'),
        API.get('/moods/analytics/summary')
      ]);
      setMoods(moodsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const logMood = async () => {
    if (!selectedMood) { toast.error('Please select a mood'); return; }
    const moodObj = MOODS.find(m => m.name === selectedMood);
    try {
      await API.post('/moods', { mood: selectedMood, emoji: moodObj?.emoji || '😊', note, energy_level: energy });
      toast.success('Mood logged! 🌟');
      setSelectedMood(''); setNote(''); setEnergy(5);
      fetchData();
    } catch (err) { toast.error('Error logging mood'); }
  };

  const doughnutData = analytics?.moodDistribution ? {
    labels: analytics.moodDistribution.map(m => m.mood),
    datasets: [{
      data: analytics.moodDistribution.map(m => parseInt(m.count)),
      backgroundColor: analytics.moodDistribution.map(m => MOODS.find(mo => mo.name === m.mood)?.color || '#ccc'),
      borderWidth: 0,
    }]
  } : null;

  const weeklyData = analytics?.weeklyMoods ? {
    labels: analytics.weeklyMoods.map(m => new Date(m.date).toLocaleDateString('en-US', { weekday: 'short' })),
    datasets: [{
      label: 'Energy Level',
      data: analytics.weeklyMoods.map(m => m.energy_level),
      backgroundColor: 'var(--accent)',
      borderRadius: 8,
    }]
  } : null;

  if (loading) return <div className="page-container"><div style={{display:'flex',justifyContent:'center',padding:60}}><div className="spinner"></div></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Mood Tracker 😊</h1>
        <p>Track your emotional journey</p>
      </div>

      <div className="chip-group" style={{ marginBottom: 24 }}>
        <button className={`chip ${tab === 'log' ? 'active' : ''}`} onClick={() => setTab('log')}>Log Mood</button>
        <button className={`chip ${tab === 'analytics' ? 'active' : ''}`} onClick={() => setTab('analytics')}>Analytics</button>
        <button className={`chip ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>History</button>
      </div>

      {tab === 'log' && (
        <div className="card" style={{ maxWidth: 600 }}>
          <h3 style={{ marginBottom: 20 }}>How are you feeling right now?</h3>
          <div className="mood-grid" style={{ marginBottom: 20 }}>
            {MOODS.map(m => (
              <div key={m.name} className={`mood-option ${selectedMood === m.name ? 'selected' : ''}`} onClick={() => setSelectedMood(m.name)}>
                <span className="mood-emoji">{m.emoji}</span>
                <span className="mood-label">{m.label}</span>
              </div>
            ))}
          </div>
          <div className="form-group">
            <label>Energy Level: {energy}/10</label>
            <input type="range" min="1" max="10" value={energy} onChange={e => setEnergy(parseInt(e.target.value))} className="energy-slider" />
          </div>
          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea className="form-textarea" value={note} onChange={e => setNote(e.target.value)} placeholder="What's on your mind?" style={{ minHeight: 80 }} />
          </div>
          <button className="btn btn-primary" onClick={logMood} style={{ width: '100%' }}>Log Mood ✨</button>
        </div>
      )}

      {tab === 'analytics' && (
        <div>
          <div className="stat-grid">
            <div className="stat-card"><div className="stat-icon">📊</div><div className="stat-value">{analytics?.totalEntries || 0}</div><div className="stat-label">Total Entries</div></div>
            <div className="stat-card"><div className="stat-icon">🔥</div><div className="stat-value">{analytics?.streak || 0}</div><div className="stat-label">Day Streak</div></div>
            <div className="stat-card"><div className="stat-icon">⚡</div><div className="stat-value">{(analytics?.avgEnergy || 0).toFixed(1)}</div><div className="stat-label">Avg Energy</div></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {doughnutData && (
              <div className="chart-container">
                <h3 style={{ marginBottom: 16 }}>Mood Distribution</h3>
                <div style={{ maxWidth: 280, margin: '0 auto' }}>
                  <Doughnut data={doughnutData} options={{ plugins: { legend: { position: 'bottom' } } }} />
                </div>
              </div>
            )}
            {weeklyData && (
              <div className="chart-container">
                <h3 style={{ marginBottom: 16 }}>Weekly Energy</h3>
                <Bar data={weeklyData} options={{ scales: { y: { beginAtZero: true, max: 10 } }, plugins: { legend: { display: false } } }} />
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="timeline">
          {moods.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">😌</div><h3>No mood entries yet</h3><p>Start logging your daily mood</p></div>
          ) : moods.map(m => (
            <div className="timeline-item" key={m.id}>
              <div className="card" style={{ padding: 16 }}>
                <div className="timeline-date">{new Date(m.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                  <span style={{ fontSize: '1.8rem' }}>{m.emoji}</span>
                  <div>
                    <p style={{ fontWeight: 600, textTransform: 'capitalize' }}>{m.mood}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Energy: {m.energy_level}/10</p>
                  </div>
                </div>
                {m.note && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 8 }}>{m.note}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
