import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient.js';
import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import BrowsePage from './pages/BrowsePage.jsx';
import SeriesPage from './pages/SeriesPage.jsx';
import WatchPage from './pages/WatchPage.jsx';
import UploadPage from './pages/UploadPage.jsx';
import AdminVideosPage from './pages/AdminVideosPage.jsx';
import MyListPage from './pages/MyListPage.jsx';
import NotFound from './pages/NotFound.jsx';
import StatsPage from './pages/StatsPage.jsx';
import SupportPage from './pages/SupportPage.jsx';
import FeedbackPage from './pages/FeedbackPage.jsx';

function App() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('cartoonstream-theme') || 'dark');
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('cartoonstream-theme', theme);
  }, [theme]);

  useEffect(() => {
    async function initializeAuth() {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
    }

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, state) => {
      if (event === 'SIGNED_IN') {
        setSession(state);
        setUser(state?.user ?? null);
      }
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        navigate('/');
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe?.();
    };
  }, [navigate]);

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <Routes>
      <Route path="/" element={<Layout user={user} onSignOut={signOut} theme={theme} onThemeToggle={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />}>
        <Route index element={<HomePage user={user} />} />
        <Route path="browse" element={<BrowsePage />} />
        <Route path="cartoon/:cartoonId" element={<SeriesPage />} />
        <Route path="watch/:episodeId" element={<WatchPage />} />
        <Route path="admin/videos" element={<AdminVideosPage user={user} />} />
        <Route path="admin/videos/category/:categoryId" element={<AdminVideosPage user={user} />} />
        <Route path="my-list" element={<MyListPage />} />
        <Route path="upload" element={<UploadPage user={user} />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
