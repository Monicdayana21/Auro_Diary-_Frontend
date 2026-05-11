import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiBook, FiSmile, FiImage, FiTarget, FiMessageSquare, FiClock, FiStar, FiMoon, FiSettings, FiLogOut, FiChevronLeft, FiChevronRight, FiMenu } from 'react-icons/fi';
import { BASE_URL } from '../api';

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { section: 'Main', items: [
      { to: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
      { to: '/journal', icon: <FiBook />, label: 'Journal' },
      { to: '/mood', icon: <FiSmile />, label: 'Mood Tracker' },
    ]},
    { section: 'Creative', items: [
      { to: '/mood-board', icon: <FiImage />, label: 'Mood Board' },
      { to: '/vision-board', icon: <FiTarget />, label: 'Vision Board' },
      { to: '/quotes', icon: <FiMessageSquare />, label: 'Quotes' },
    ]},
    { section: 'Memories', items: [
      { to: '/memories', icon: <FiClock />, label: 'Timeline' },
      { to: '/capsules', icon: <FiStar />, label: 'Capsules' },
      { to: '/dreams', icon: <FiMoon />, label: 'Dreams' },
    ]},
    { section: 'Settings', items: [
      { to: '/settings', icon: <FiSettings />, label: 'Settings' },
    ]},
  ];

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
        <FiMenu />
      </button>

      {mobileOpen && <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.3)',zIndex:99}} onClick={closeMobile} />}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-toggle" onClick={() => { setCollapsed(!collapsed); closeMobile(); }}>
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </div>

        <div className="sidebar-header">
          <span className="logo-icon">✨</span>
          <div className="logo-text">
            <h2>Aura Diary</h2>
            <p>Your aesthetic journal</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((section) => (
            <div className="nav-section" key={section.section}>
              <div className="nav-section-title">{section.section}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={closeMobile}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer" onClick={() => { navigate('/settings'); closeMobile(); }}>
          <div className="avatar">
            {user?.avatar ? (
              <img 
                src={user.avatar.startsWith('/uploads/') ? `${BASE_URL}${user.avatar}` : user.avatar} 
                alt="" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} 
              />
            ) : (
              user?.name?.[0]?.toUpperCase() || 'A'
            )}
          </div>
          <div className="user-info">
            <p>{user?.name || 'User'}</p>
            <span>{user?.email || ''}</span>
          </div>
        </div>
      </aside>
    </>
  );
}
