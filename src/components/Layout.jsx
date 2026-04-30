import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';

export default function Layout({ user, onSignOut }) {
  return (
    <div className="app-shell">
      <div className="motion-backdrop" aria-hidden="true" />
      <header className="navbar">
        <div className="navbar-inner">
          <Navbar user={user} onSignOut={onSignOut} />
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}
