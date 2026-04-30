import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, Layers, Play, Search, Star } from 'lucide-react';
import { fetchCatalog, flattenEpisodes, formatDuration, getFirstEpisode } from '../lib/catalog.js';

export default function BrowsePage() {
  const [cartoons, setCartoons] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
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

  const categoryOptions = useMemo(() => {
    const categories = cartoons.flatMap((cartoon) => cartoon.categories.map((category) => category.name));
    const genres = cartoons.flatMap((cartoon) => cartoon.genres ?? []);
    return [...new Set([...categories, ...genres])].sort();
  }, [cartoons]);

  const filteredCartoons = useMemo(() => {
    const query = search.trim().toLowerCase();

    return cartoons.filter((cartoon) => {
      const matchesQuery =
        !query ||
        cartoon.title.toLowerCase().includes(query) ||
        cartoon.description.toLowerCase().includes(query) ||
        flattenEpisodes([cartoon]).some((episode) => episode.name.toLowerCase().includes(query));

      const matchesCategory =
        !categoryFilter ||
        cartoon.genres.includes(categoryFilter) ||
        cartoon.categories.some((category) => category.name === categoryFilter);

      return matchesQuery && matchesCategory;
    });
  }, [cartoons, search, categoryFilter]);

  const featuredEpisodes = useMemo(() => {
    return flattenEpisodes(filteredCartoons)
      .sort((left, right) => right.views - left.views)
      .slice(0, 4);
  }, [filteredCartoons]);

  return (
    <section className="browse-screen">
      <div className="browse-header">
        <div>
          <p className="eyebrow">Browse</p>
          <h1 className="page-title">Cartoon collections</h1>
          <p className="section-subtitle">Alien action, fantasy quests, anime battles, and superhero episodes in one place.</p>
        </div>
        <div className="browse-controls">
          <label>
            <span>
              <Search size={15} /> Search
            </span>
            <input
              type="search"
              placeholder="Ben 10, Omniverse, Saiyan..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <label>
            <span>
              <Layers size={15} /> Category
            </span>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="">All categories</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {loading ? (
        <p className="soft-status">Loading catalog...</p>
      ) : (
        <div className="series-grid">
          {filteredCartoons.map((cartoon) => {
            const firstEpisode = getFirstEpisode(cartoon);

            return (
              <article key={cartoon.id} className="browse-card">
                <Link to={`/cartoon/${cartoon.id}`} className="browse-art">
                  <img src={cartoon.image_url} alt={cartoon.title} />
                  <span className="round-play">
                    <Play size={18} fill="currentColor" />
                  </span>
                </Link>
                <div className="browse-card-body">
                  <div className="card-meta">
                    <span>{cartoon.year}</span>
                    <span>{cartoon.maturity}</span>
                    <span>{cartoon.rating.toFixed(1)} rating</span>
                  </div>
                  <h2>{cartoon.title}</h2>
                  <p>{cartoon.description}</p>
                  <div className="genre-row compact">
                    {cartoon.genres.map((genre) => (
                      <span key={genre}>{genre}</span>
                    ))}
                  </div>
                  <div className="card-actions">
                    <Link to={`/cartoon/${cartoon.id}`} className="button">
                      <Layers size={17} /> Categories
                    </Link>
                    {firstEpisode && (
                      <Link to={`/watch/${firstEpisode.id}`} className="btn-secondary">
                        <Play size={17} /> Play
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!loading && filteredCartoons.length === 0 && <p className="soft-status">No matching cartoons found.</p>}

      {featuredEpisodes.length > 0 && (
        <section className="quick-episodes">
          <div className="rail-heading">
            <h2>High energy episodes</h2>
          </div>
          <div className="quick-episode-grid">
            {featuredEpisodes.map((episode) => (
              <Link key={episode.id} to={`/watch/${episode.id}`} className="episode-list-card">
                <img src={episode.thumbnail_url || episode.cartoon.image_url} alt={episode.name} />
                <div>
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
      )}

      <section className="spotlight-band">
        <div>
          <p className="eyebrow">New premieres</p>
          <h2>Fresh cartoons, seasons, thumbnails, and videos can join the catalog from the studio desk.</h2>
        </div>
        <Link to="/upload" className="button">
          <Star size={18} /> Upload
        </Link>
      </section>
    </section>
  );
}
