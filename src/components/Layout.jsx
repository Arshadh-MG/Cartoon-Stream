import { Link, Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';

export default function Layout({ user, onSignOut, theme, onThemeToggle }) {
  return (
    <div className="app-shell">
      <div className="motion-backdrop" aria-hidden="true" />
      <header className="navbar">
        <div className="navbar-inner">
          <Navbar user={user} onSignOut={onSignOut} theme={theme} onThemeToggle={onThemeToggle} />
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="footer-inner">
          <div>
            <p className="eyebrow">Support</p>
            <h2>Need help with CartoonStream?</h2>
            <p>Reach the admin team for upload, playback, account, or collection issues.</p>
          </div>
          <div className="footer-actions">
            <Link className="btn-secondary" to="/support">
              Contact support
            </Link>
            <Link className="button" to="/feedback">
              Send feedback
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
