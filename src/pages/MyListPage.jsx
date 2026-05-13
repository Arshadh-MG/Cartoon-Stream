import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Trash2 } from 'lucide-react';
import { fetchCatalog, getFirstEpisode } from '../lib/catalog.js';
import { getSavedCartoonIds, removeSavedCartoonId } from '../lib/myList.js';

export default function MyListPage() {
  const [cartoons, setCartoons] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
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

  useEffect(() => {
    setSavedIds(getSavedCartoonIds());
  }, [loading]);

  const savedCartoons = useMemo(() => {
    return cartoons.filter((cartoon) => savedIds.includes(String(cartoon.id)));
  }, [cartoons, savedIds]);

  const handleRemove = (cartoonId) => {
    setSavedIds(removeSavedCartoonId(cartoonId));
  };

  if (loading) {
    return <p className="soft-status">Loading your list...</p>;
  }

  if (savedCartoons.length === 0) {
    return (
      <section className="empty-state">
        <h1>Your list is empty</h1>
        <p>Save cartoons from the Home or Series screens and come back to watch them later.</p>
        <Link to="/browse" className="button">
          <ArrowLeft size={18} /> Browse cartoons
        </Link>
      </section>
    );
  }

  return (
    <section className="my-list-screen">
      <div className="section-header">
        <div>
          <p className="eyebrow">My list</p>
          <h1 className="page-title">Saved cartoons</h1>
          <p className="section-subtitle">Quick access to the series you bookmarked for later.</p>
        </div>
      </div>

      <div className="my-list-grid">
        {savedCartoons.map((cartoon) => {
          const firstEpisode = getFirstEpisode(cartoon);

          return (
            <article key={cartoon.id} className="my-list-card">
              <img src={cartoon.image_url} alt={cartoon.title} />
              <div className="my-list-card-body">
                <div>
                  <p className="eyebrow">{cartoon.year}</p>
                  <h2>{cartoon.title}</h2>
                  <p>{cartoon.description}</p>
                </div>
                <div className="card-actions">
                  <Link to={`/cartoon/${cartoon.id}`} className="button">
                    <Play size={18} /> View series
                  </Link>
                  {firstEpisode && (
                    <Link to={`/watch/${firstEpisode.id}`} className="btn-secondary">
                      <Play size={18} /> Play
                    </Link>
                  )}
                  <button type="button" className="btn-secondary" onClick={() => handleRemove(cartoon.id)}>
                    <Trash2 size={18} /> Remove
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
