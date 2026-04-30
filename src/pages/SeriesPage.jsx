import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Eye, Layers, Play, Star } from 'lucide-react';
import { fetchCatalog, findCartoon, formatDuration, getFirstEpisode } from '../lib/catalog.js';
import { isCartoonSaved, toggleSavedCartoonId } from '../lib/myList.js';

export default function SeriesPage() {
  const { cartoonId } = useParams();
  const [cartoons, setCartoons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [isSaved, setIsSaved] = useState(false);

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

  const cartoon = useMemo(() => findCartoon(cartoons, cartoonId), [cartoons, cartoonId]);

  useEffect(() => {
    if (cartoon?.categories?.length && !selectedCategoryId) {
      setSelectedCategoryId(String(cartoon.categories[0].id));
    }
  }, [cartoon, selectedCategoryId]);

  useEffect(() => {
    if (!cartoon) return;
    setIsSaved(isCartoonSaved(cartoon.id));
  }, [cartoon]);

  const selectedCategory = useMemo(() => {
    return cartoon?.categories.find((category) => String(category.id) === selectedCategoryId) ?? cartoon?.categories?.[0];
  }, [cartoon, selectedCategoryId]);

  const firstEpisode = getFirstEpisode(cartoon);
  const otherSeries = cartoons.filter((item) => String(item.id) !== String(cartoonId)).slice(0, 3);

  if (loading) {
    return <p className="soft-status">Loading series...</p>;
  }

  if (!cartoon) {
    return (
      <section className="empty-state">
        <h1>Series not found</h1>
        <Link to="/browse" className="button">
          <ArrowLeft size={18} /> Back to browse
        </Link>
      </section>
    );
  }

  return (
    <section className="series-screen">
      <section className="series-hero" style={{ '--hero-image': `url(${cartoon.hero_image_url || cartoon.image_url})` }}>
        <Link to="/browse" className="btn-link over-hero">
          <ArrowLeft size={18} /> Browse
        </Link>

        <div className="series-hero-content">
          <img className="series-poster" src={cartoon.poster_url || cartoon.image_url} alt={cartoon.title} />
          <div>
            <p className="eyebrow">Series collection</p>
            <h1>{cartoon.title}</h1>
            <p className="hero-tagline">{cartoon.tagline || cartoon.description}</p>
            <div className="hero-meta">
              <span>{cartoon.year}</span>
              <span>{cartoon.maturity}</span>
              <span>{cartoon.rating.toFixed(1)} rating</span>
              <span>{cartoon.episode_count} episodes</span>
            </div>
            <div className="genre-row">
              {cartoon.genres.map((genre) => (
                <span key={genre}>{genre}</span>
              ))}
            </div>
            <div className="hero-actions">
              {firstEpisode && (
                <Link to={`/watch/${firstEpisode.id}`} className="button primary-action">
                  <Play size={20} fill="currentColor" /> Play
                </Link>
              )}
              <button
              type="button"
              className={`btn-secondary ${isSaved ? 'is-selected' : ''}`}
              onClick={() => {
                if (!cartoon) return;
                toggleSavedCartoonId(cartoon.id);
                setIsSaved((current) => !current);
              }}
            >
                <Star size={18} /> {isSaved ? 'Saved' : 'My List'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="category-shell">
        <div className="category-tabs" role="tablist" aria-label={`${cartoon.title} categories`}>
          {cartoon.categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={String(selectedCategory?.id) === String(category.id) ? 'active' : ''}
              onClick={() => setSelectedCategoryId(String(category.id))}
            >
              <Layers size={16} /> {category.name}
            </button>
          ))}
        </div>

        {selectedCategory && (
          <div className="category-overview">
            <div>
              <p className="eyebrow">{selectedCategory.episodes.length} episodes</p>
              <h2>{selectedCategory.name}</h2>
              {selectedCategory.description && <p>{selectedCategory.description}</p>}
            </div>
          </div>
        )}

        <div className="episode-grid">
          {selectedCategory?.episodes.map((episode) => (
            <Link key={episode.id} to={`/watch/${episode.id}`} className="episode-card-large">
              <div className="episode-thumb">
                <img src={episode.thumbnail_url || cartoon.image_url} alt={episode.name} />
                <span className="round-play">
                  <Play size={18} fill="currentColor" />
                </span>
              </div>
              <div className="episode-card-copy">
                <p className="eyebrow">Episode {episode.episode_number}</p>
                <h3>{episode.name}</h3>
                <p>{episode.description}</p>
                <div className="compact-meta">
                  <span>
                    <Clock size={14} /> {formatDuration(episode.duration)}
                  </span>
                  <span>
                    <Eye size={14} /> {episode.views.toLocaleString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {otherSeries.length > 0 && (
        <section className="more-series">
          <div className="rail-heading">
            <h2>More to watch</h2>
          </div>
          <div className="mini-series-grid">
            {otherSeries.map((item) => (
              <Link key={item.id} to={`/cartoon/${item.id}`} className="mini-series-card">
                <img src={item.image_url} alt={item.title} />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.episode_count} episodes</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
