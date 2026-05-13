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

function DoomScroller({ title, episodes }) {
  const scrollerRef = useRef(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || episodes.length < 2) return undefined;

    let frameId = 0;
    let lastTime = performance.now();
    let paused = false;
    const speed = 0.038;

    const pause = () => {
      paused = true;
    };
    const resume = () => {
      paused = false;
      lastTime = performance.now();
    };

    function tick(time) {
      const delta = time - lastTime;
      lastTime = time;

      if (!paused) {
        scroller.scrollLeft += delta * speed;
        if (scroller.scrollLeft >= scroller.scrollWidth / 2) {
          scroller.scrollLeft = 0;
        }
      }

      frameId = requestAnimationFrame(tick);
    }

    scroller.addEventListener('pointerenter', pause);
    scroller.addEventListener('focusin', pause);
    scroller.addEventListener('pointerleave', resume);
    scroller.addEventListener('focusout', resume);
    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      scroller.removeEventListener('pointerenter', pause);
      scroller.removeEventListener('focusin', pause);
      scroller.removeEventListener('pointerleave', resume);
      scroller.removeEventListener('focusout', resume);
    };
  }, [episodes]);

  if (!episodes.length) return null;

  const loopLength = Math.max(episodes.length * 2, 8);
  const loopingEpisodes = Array.from({ length: loopLength }, (_item, index) => episodes[index % episodes.length]);

  return (
    <section className="doom-scroll-section" aria-label={title}>
      <div className="rail-heading">
        <h2>{title}</h2>
        <div className="rail-actions">
          <button type="button" className="icon-button" onClick={() => scrollRail(scrollerRef, -1)} aria-label="Scroll new collection left" title="Scroll left">
            <ChevronLeft size={20} />
          </button>
          <button type="button" className="icon-button" onClick={() => scrollRail(scrollerRef, 1)} aria-label="Scroll new collection right" title="Scroll right">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <div className="doom-scroll-window" ref={scrollerRef}>
        <div className="doom-scroll-track">
          {loopingEpisodes.map((episode, index) => (
            <Link key={`${episode.id}-${index}`} to={`/watch/${episode.id}`} className="doom-scroll-card">
              <img src={episode.thumbnail_url || episode.cartoon.image_url} alt={episode.name} />
              <div>
                <p className="eyebrow">{episode.cartoon.title}</p>
                <h3>{episode.name}</h3>
                <span>Episode {episode.episode_number}</span>
              </div>
            </Link>
          ))}
        </div>
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
  const [featuredIndex, setFeaturedIndex] = useState(0);
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

  const stats = useMemo(() => getCatalogStats(cartoons), [cartoons]);
  const popularEpisodes = useMemo(() => {
    return flattenEpisodes(cartoons)
      .sort((left, right) => right.views - left.views)
      .slice(0, 8);
  }, [cartoons]);
  const recentlyAdded = useMemo(() => [...cartoons].reverse(), [cartoons]);
  const newCollectionEpisodes = useMemo(() => {
    return flattenEpisodes(cartoons).slice(-10).reverse();
  }, [cartoons]);
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

    return [...groups.values()];
  }, [cartoons]);

  const heroSlides = useMemo(() => {
    const seriesSlides = cartoons.map((cartoon) => ({
      id: `series-${cartoon.id}`,
      type: 'series',
      eyebrow: 'Featured series',
      title: cartoon.title,
      tagline: cartoon.tagline || cartoon.description,
      image: cartoon.hero_image_url || cartoon.image_url,
      meta: [cartoon.year, cartoon.maturity, `${cartoon.rating.toFixed(1)} rating`, `${cartoon.episode_count} episodes`],
      genres: cartoon.genres,
      cartoon,
      firstEpisode: getFirstEpisode(cartoon),
      secondaryPath: `/cartoon/${cartoon.id}`,
      secondaryLabel: 'Episodes',
    }));

    const categorySlides = categoryHighlights.map((category) => ({
      id: `category-${category.name}`,
      type: 'category',
      eyebrow: 'Category spotlight',
      title: category.name,
      tagline: `${category.seriesCount} series and ${category.episodeCount} episodes are ready in this category.`,
      image: category.image,
      meta: [`${category.seriesCount} series`, `${category.episodeCount} episodes`, 'Category'],
      genres: ['Browse', 'Collection'],
      secondaryPath: '/browse',
      secondaryLabel: 'Browse category',
    }));

    const newestEpisode = newCollectionEpisodes[0];
    const newCollectionSlide = newestEpisode && {
      id: 'new-collection',
      type: 'new',
      eyebrow: 'New collection',
      title: 'New collection videos',
      tagline: 'Latest uploaded episodes are moving through the collection rail below.',
      image: newestEpisode.thumbnail_url || newestEpisode.cartoon.image_url,
      meta: [`${newCollectionEpisodes.length} new picks`, 'Auto + manual scroll'],
      genres: ['Fresh videos', newestEpisode.cartoon.title],
      firstEpisode: newestEpisode,
      secondaryPath: '/browse',
      secondaryLabel: 'Browse all',
    };

    return [...seriesSlides, ...categorySlides, newCollectionSlide].filter(Boolean);
  }, [cartoons, categoryHighlights, newCollectionEpisodes]);

  useEffect(() => {
    if (heroSlides.length < 2) return undefined;
    const intervalId = window.setInterval(() => {
      setFeaturedIndex((current) => (current + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [heroSlides.length]);

  useEffect(() => {
    if (featuredIndex >= heroSlides.length) {
      setFeaturedIndex(0);
    }
  }, [heroSlides.length, featuredIndex]);

  const featuredSlide = heroSlides[featuredIndex] || heroSlides[0];
  const featured = featuredSlide?.cartoon || cartoons[0];
  const firstEpisode = featuredSlide?.firstEpisode || getFirstEpisode(featured);

  useEffect(() => {
    if (!featured || featuredSlide?.type !== 'series') {
      setFeaturedSaved(false);
      return;
    }
    setFeaturedSaved(isCartoonSaved(featured.id));
  }, [featured, featuredSlide]);

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

      <section className="hero-cinema" style={{ '--hero-image': `url(${featuredSlide.image || featured.image_url})` }}>
        <div className="hero-copy">
          <p className="eyebrow">{featuredSlide.eyebrow}</p>
          <h1>{featuredSlide.title}</h1>
          <p className="hero-tagline">{featuredSlide.tagline}</p>
          <div className="hero-meta">
            {featuredSlide.meta.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="genre-row">
            {featuredSlide.genres.map((genre) => (
              <span key={genre}>{genre}</span>
            ))}
          </div>
          <div className="hero-actions">
            {firstEpisode && (
              <Link to={`/watch/${firstEpisode.id}`} className="button primary-action">
                <Play size={20} fill="currentColor" /> Play
              </Link>
            )}
            <Link to={featuredSlide.secondaryPath} className="btn-secondary">
              <Info size={18} /> {featuredSlide.secondaryLabel}
            </Link>
            {featuredSlide.type === 'series' && (
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
            )}
          </div>
          {heroSlides.length > 1 && (
            <div className="hero-carousel-controls" aria-label="Featured carousel">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  className={index === featuredIndex ? 'active' : ''}
                  onClick={() => setFeaturedIndex(index)}
                  aria-label={`Show ${slide.title}`}
                />
              ))}
            </div>
          )}
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

      <CategoryDiscovery categories={categoryHighlights} />
      <DoomScroller title="New collection videos" episodes={newCollectionEpisodes} />
      <SeriesRail title="Top picks for you" cartoons={cartoons} />
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
