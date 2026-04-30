import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, Eye, Info, Layers, Play, Plus, Star } from 'lucide-react';
import { fetchCatalog, flattenEpisodes, formatDuration, getCatalogStats, getFirstEpisode } from '../lib/catalog.js';
import { getSavedCartoonIds, isCartoonSaved, toggleSavedCartoonId } from '../lib/myList.js';

function scrollRail(ref, direction) {
  ref.current?.scrollBy({ left: direction * 460, behavior: 'smooth' });
}

function SeriesRail({ title, cartoons }) {
  const railRef = useRef(null);

  return (
    <section className="content-rail-section">
      <div className="rail-heading">
        <h2>{title}</h2>
        <div className="rail-actions">
          <button type="button" className="icon-button" onClick={() => scrollRail(railRef, -1)} aria-label="Scroll left" title="Scroll left">
            <ChevronLeft size={20} />
          </button>
          <button type="button" className="icon-button" onClick={() => scrollRail(railRef, 1)} aria-label="Scroll right" title="Scroll right">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <div className="poster-rail" ref={railRef}>
        {cartoons.map((cartoon) => (
          <Link key={cartoon.id} to={`/cartoon/${cartoon.id}`} className="series-card floating-card">
            <img src={cartoon.poster_url || cartoon.image_url} alt={cartoon.title} />
            <div className="series-card-overlay">
              <div>
                <h3>{cartoon.title}</h3>
                <p>{cartoon.episode_count} episodes</p>
              </div>
              <span className="round-play">
                <Play size={16} fill="currentColor" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function EpisodeRail({ title, episodes }) {
  const railRef = useRef(null);

  return (
    <section className="content-rail-section">
      <div className="rail-heading">
        <h2>{title}</h2>
        <div className="rail-actions">
          <button type="button" className="icon-button" onClick={() => scrollRail(railRef, -1)} aria-label="Scroll left" title="Scroll left">
            <ChevronLeft size={20} />
          </button>
          <button type="button" className="icon-button" onClick={() => scrollRail(railRef, 1)} aria-label="Scroll right" title="Scroll right">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <div className="episode-rail" ref={railRef}>
        {episodes.map((episode) => (
          <Link key={`${episode.cartoon.id}-${episode.id}`} to={`/watch/${episode.id}`} className="episode-tile">
            <img src={episode.thumbnail_url || episode.cartoon.image_url} alt={episode.name} />
            <div className="episode-tile-body">
              <p className="eyebrow">{episode.cartoon.title}</p>
              <h3>{episode.name}</h3>
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
  );
}

function CategoryDiscovery({ categories }) {
  if (!categories.length) return null;

  return (
    <section className="content-rail-section">
      <div className="rail-heading">
        <h2>Explore categories</h2>
      </div>
      <div className="category-discovery-grid">
        {categories.map((category) => (
          <Link key={category.name} to="/browse" className="category-discovery-card" style={{ '--category-image': `url(${category.image})` }}>
            <div>
              <p className="eyebrow">
                <Layers size={14} /> {category.seriesCount} series
              </p>
              <h3>{category.name}</h3>
              <p>{category.episodeCount} episodes</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const [cartoons, setCartoons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredSaved, setFeaturedSaved] = useState(false);

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

  const featured = cartoons[0];
  const firstEpisode = getFirstEpisode(featured);

  useEffect(() => {
    if (!featured) return;
    setFeaturedSaved(isCartoonSaved(featured.id));
  }, [featured]);

  const stats = useMemo(() => getCatalogStats(cartoons), [cartoons]);
  const popularEpisodes = useMemo(() => {
    return flattenEpisodes(cartoons)
      .sort((left, right) => right.views - left.views)
      .slice(0, 8);
  }, [cartoons]);
  const recentlyAdded = useMemo(() => [...cartoons].reverse(), [cartoons]);
  const categoryHighlights = useMemo(() => {
    const groups = new Map();

    cartoons.forEach((cartoon) => {
      cartoon.categories.forEach((category) => {
        const current = groups.get(category.name) ?? {
          name: category.name,
          seriesCount: 0,
          episodeCount: 0,
          image: category.episodes[0]?.thumbnail_url || cartoon.image_url,
        };

        current.seriesCount += 1;
        current.episodeCount += category.episodes.length;
        groups.set(category.name, current);
      });
    });

    return [...groups.values()].slice(0, 8);
  }, [cartoons]);

  if (!featured && loading) {
    return <p className="soft-status">Loading your cartoon universe...</p>;
  }

  if (!featured) {
    return <p className="soft-status">No cartoons are available yet.</p>;
  }

  return (
    <section className="home-screen">
      <div className="floating-shards" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>

      <section className="hero-cinema" style={{ '--hero-image': `url(${featured.hero_image_url || featured.image_url})` }}>
        <div className="hero-copy">
          <p className="eyebrow">Featured series</p>
          <h1>{featured.title}</h1>
          <p className="hero-tagline">{featured.tagline || featured.description}</p>
          <div className="hero-meta">
            <span>{featured.year}</span>
            <span>{featured.maturity}</span>
            <span>{featured.rating.toFixed(1)} rating</span>
            <span>{featured.episode_count} episodes</span>
          </div>
          <div className="genre-row">
            {featured.genres.map((genre) => (
              <span key={genre}>{genre}</span>
            ))}
          </div>
          <div className="hero-actions">
            {firstEpisode && (
              <Link to={`/watch/${firstEpisode.id}`} className="button primary-action">
                <Play size={20} fill="currentColor" /> Play
              </Link>
            )}
            <Link to={`/cartoon/${featured.id}`} className="btn-secondary">
              <Info size={18} /> Episodes
            </Link>
            <button
              type="button"
              className={`btn-secondary ${featuredSaved ? 'is-selected' : ''}`}
              onClick={() => {
                if (!featured) return;
                toggleSavedCartoonId(featured.id);
                setFeaturedSaved((current) => !current);
              }}
            >
              <Plus size={18} /> {featuredSaved ? 'Saved' : 'My List'}
            </button>
          </div>
        </div>

        <aside className="hero-stat-strip">
          <div>
            <strong>{stats.cartoons}</strong>
            <span>Series</span>
          </div>
          <div>
            <strong>{stats.episodes}</strong>
            <span>Episodes</span>
          </div>
          <div>
            <strong>{stats.views.toLocaleString()}</strong>
            <span>Views</span>
          </div>
        </aside>
      </section>

      <SeriesRail title="Top picks for you" cartoons={cartoons} />
      <CategoryDiscovery categories={categoryHighlights} />
      <EpisodeRail title="Popular episodes" episodes={popularEpisodes} />
      <SeriesRail title="Recently added" cartoons={recentlyAdded} />

      <section className="spotlight-band">
        <div>
          <p className="eyebrow">Tonight's lineup</p>
          <h2>Alien battles, fantasy quests, superhero nights, and weekend classics are ready to roll.</h2>
        </div>
        <Link to="/browse" className="button">
          <Star size={18} /> Browse all
        </Link>
      </section>

      {loading && <p className="soft-status">Refreshing catalog...</p>}
    </section>
  );
}
