import { Link, NavLink } from 'react-router-dom';
import { BarChart3, Film, Heart, Home, ShieldCheck, Upload } from 'lucide-react';

export default function Navbar({ user, onSignOut }) {
  return (
    <div className="navbar-content">
      <Link to="/" className="brand" aria-label="CartoonStream home">
        <span className="brand-mark">CS</span>
        <span>CartoonStream</span>
      </Link>

      <nav className="nav-links" aria-label="Primary navigation">
        <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} end>
          <Home size={16} /> Home
        </NavLink>
        <NavLink to="/browse" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <Film size={16} /> Browse
        </NavLink>
        <NavLink to="/my-list" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <Heart size={16} /> My List
        </NavLink>
        <NavLink to="/stats" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <BarChart3 size={16} /> Stats
        </NavLink>
        <NavLink to="/upload" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <Upload size={16} /> Upload
        </NavLink>
      </nav>

      <div className="nav-session">
        {user ? (
          <>
            <span className="session-email">{user.email}</span>
            <button className="button nav-button" onClick={onSignOut}>
              <ShieldCheck size={16} /> Sign Out
            </button>
          </>
        ) : (
          <Link to="/upload" className="button nav-button">
            <Heart size={16} /> Sign In
          </Link>
        )}
      </div>
    </div>
  );
}
