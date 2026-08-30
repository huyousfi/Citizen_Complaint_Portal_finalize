import { NavLink } from 'react-router-dom'
import logo from '../assets/logo.jpeg'

export default function Layout({ user, onLogout, children }) {
  const navigation =
    user?.role === 'officer'
      ? [
          { to: '/officer/dashboard', label: 'Officer Dashboard' },
          { to: '/officer/analytics', label: 'Analytics' },
          { to: '/officer/map', label: 'Map View' },
        ]
      : [
          { to: '/', label: 'Home' },
          { to: '/complaints', label: 'Browse Complaints' },
          { to: '/login', label: 'Login' },
          { to: '/signup', label: 'Sign Up' },
        ]

  return (
    <div className="portal-shell husain-shell">
      <header className="topbar husain-topbar">
        <div className="brand-wrap">
          <img src={logo} alt="CivicPulse logo" className="brand-logo" />
          <div className="brand-copy">
            <p className="eyebrow">CITIZEN PORTAL</p>
            <h2>PUBLIC SERVICE</h2>
          </div>
        </div>

        <nav className="main-nav husain-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <NavLink key={item.to} to={item.to} end>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="topbar-actions">
          {user ? (
            <>
              <div className="user-pill">
                <span className="user-avatar">{user?.name?.charAt(0) || 'U'}</span>
                <div>
                  <strong>{user?.name || 'User'}</strong>
                  <small>{user?.role === 'officer' ? 'Officer access' : 'Citizen access'}</small>
                </div>
              </div>
              <button className="ghost-button" type="button" onClick={onLogout}>Log out</button>
            </>
          ) : (
            <NavLink to="/complaints/new" className="primary-button small-button">Start a Project</NavLink>
          )}
        </div>
      </header>

      <main className="dashboard">{children}</main>
    </div>
  )
}
