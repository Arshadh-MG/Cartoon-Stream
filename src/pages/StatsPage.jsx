import { useEffect, useMemo, useState } from 'react';
import { Activity, Eye, Film, Layers } from 'lucide-react';
import { fetchCatalog, getCatalogStats } from '../lib/catalog.js';

export default function StatsPage() {
  const [cartoons, setCartoons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    fetchCatalog()
      .then((catalog) => {
        if (mounted) setCartoons(catalog);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => getCatalogStats(cartoons), [cartoons]);
  const categoryCount = useMemo(() => cartoons.reduce((sum, cartoon) => sum + cartoon.categories.length, 0), [cartoons]);

  return (
    <section className="stats-screen">
      <div className="section-header">
        <div>
          <p className="eyebrow">Streaming pulse</p>
          <h1 className="page-title">Platform statistics</h1>
          <p className="section-subtitle">Catalog momentum, episode depth, and audience activity.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <Film size={22} />
          <p className="stat-number">{loading ? '...' : stats.cartoons}</p>
          <p className="stat-label">Series</p>
        </div>
        <div className="stat-card">
          <Activity size={22} />
          <p className="stat-number">{loading ? '...' : stats.episodes}</p>
          <p className="stat-label">Episodes</p>
        </div>
        <div className="stat-card">
          <Layers size={22} />
          <p className="stat-number">{loading ? '...' : categoryCount}</p>
          <p className="stat-label">Categories</p>
        </div>
        <div className="stat-card">
          <Eye size={22} />
          <p className="stat-number">{loading ? '...' : stats.views.toLocaleString()}</p>
          <p className="stat-label">Views</p>
        </div>
      </div>
    </section>
  );
}
