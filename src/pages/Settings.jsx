import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { THEMES } from '../constants';
import API from '../api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const { themeName, changeTheme } = useTheme();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [pin, setPin] = useState(user?.pin_lock || '');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [tab, setTab] = useState('profile');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const saveProfile = async () => {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('bio', bio);
      formData.append('theme', themeName);
      formData.append('pin_lock', pin);
      
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await API.put('/auth/profile', formData);
      updateUser(res.data);
      setAvatarFile(null);
      setAvatarPreview(null);
      toast.success('Profile updated! ✨');
    } catch (err) { 
      console.error('Update profile error:', err);
      toast.error(err.response?.data?.error || 'Error updating profile'); 
    }
  };

  const changePassword = async () => {
    if (newPw.length < 6) { toast.error('Min 6 characters'); return; }
    try {
      await API.put('/auth/change-password', { currentPassword: currentPw, newPassword: newPw });
      toast.success('Password changed!');
      setCurrentPw(''); setNewPw('');
    } catch (err) { toast.error(err.response?.data?.error || 'Error'); }
  };

  const handleThemeChange = async (t) => {
    changeTheme(t);
    try {
      const res = await API.put('/auth/profile', { theme: t });
      updateUser(res.data);
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="page-container">
      <div className="page-header"><h1>Settings ⚙️</h1><p>Customize your Aura Diary</p></div>

      <div className="chip-group" style={{ marginBottom: 24 }}>
        <button className={`chip ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>Profile</button>
        <button className={`chip ${tab === 'themes' ? 'active' : ''}`} onClick={() => setTab('themes')}>Themes</button>
        <button className={`chip ${tab === 'security' ? 'active' : ''}`} onClick={() => setTab('security')}>Security</button>
      </div>

      {tab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: 32, alignItems: 'start' }}>
          <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div className="profile-avatar-wrapper">
              {avatarPreview ? (
                <img src={avatarPreview} alt="" />
              ) : user?.avatar ? (
                <img src={user.avatar.startsWith('/uploads/') ? `http://localhost:5000${user.avatar}` : user.avatar} alt="" />
              ) : (
                <div className="avatar-placeholder">
                  {user?.name?.charAt(0) || '👤'}
                </div>
              )}
              <label className="profile-badge" style={{ cursor: 'pointer' }}>
                📷
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              </label>
            </div>
            
            <h2 style={{ marginBottom: 4 }}>{user?.name}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>{user?.email}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left', background: 'var(--accent-light)', padding: 20, borderRadius: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Member Since</span>
                <span style={{ fontWeight: 600 }}>{new Date(user?.created_at).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Aura Points</span>
                <span style={{ fontWeight: 600, color: 'var(--accent)' }}>1,240 ✨</span>
              </div>
            </div>

            <div style={{ marginTop: 32 }}>
              <button className="btn btn-danger btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={handleLogout}>
                <FiLogOut /> Logout Session
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: 40 }}>
            <h3 style={{ marginBottom: 32, fontSize: '1.4rem' }}>Account Details</h3>
            
            <div className="form-group">
              <label>Display Name</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" />
            </div>

            <div className="form-group">
              <label>Email Address (Private)</label>
              <input className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.7, background: 'var(--bg-main)', cursor: 'not-allowed' }} />
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 6 }}>Email cannot be changed for security reasons.</p>
            </div>

            <div className="form-group">
              <label>Personal Bio</label>
              <textarea className="form-textarea" value={bio} onChange={e => setBio(e.target.value)} placeholder="Write something about your journey..." style={{ minHeight: 140 }} />
            </div>

            <div style={{ marginTop: 12 }}>
              <button className="btn btn-primary" onClick={saveProfile} style={{ width: '100%', height: 48, justifyContent: 'center', fontSize: '1rem' }}>
                Update Profile Info
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'themes' && (
        <div>
          <h3 style={{ marginBottom: 16 }}>Choose Your Aesthetic</h3>
          <div className="theme-grid">
            {Object.entries(THEMES).map(([key, t]) => (
              <div key={key} className={`theme-option ${themeName === key ? 'active' : ''}`} onClick={() => handleThemeChange(key)}
                style={{ background: t.bgMain, borderColor: themeName === key ? t.accent : t.border }}>
                <div className="theme-emoji">{t.emoji}</div>
                <div className="theme-name" style={{ color: t.textPrimary }}>{t.name}</div>
                <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 8 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: t.accent }} />
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: t.primaryLight }} />
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: t.textPrimary }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div style={{ maxWidth: 500 }}>
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16 }}>Change Password</h3>
            <div className="form-group"><label>Current Password</label><input className="form-input" type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} /></div>
            <div className="form-group"><label>New Password</label><input className="form-input" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} /></div>
            <button className="btn btn-primary" onClick={changePassword}>Update Password</button>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>PIN Lock</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>Set a PIN to protect your diary</p>
            <div className="form-group"><label>PIN (4-6 digits)</label><input className="form-input" type="password" value={pin} onChange={e => setPin(e.target.value)} maxLength={6} placeholder="Enter PIN..." /></div>
            <button className="btn btn-primary" onClick={saveProfile}>Save PIN</button>
          </div>
        </div>
      )}
    </div>
  );
}
