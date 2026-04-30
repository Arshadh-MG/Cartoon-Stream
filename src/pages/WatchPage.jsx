import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Eye, Layers, PlayCircle } from 'lucide-react';
import AdvancedVideoPlayer from '../components/AdvancedVideoPlayer.jsx';
import { fetchCatalog, findEpisodeContext, formatDuration, normalizeEpisode } from '../lib/catalog.js';
import { isSupabaseConfigured, supabase } from '../supabaseClient.js';

export default function WatchPage() {
  const { episodeId } = useParams();
  const navigate = useNavigate();
  const [cartoons, setCartoons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remoteEpisode, setRemoteEpisode] = useState(null);
  const [remoteCartoon, setRemoteCartoon] = useState(null);
  const [remoteCategory, setRemoteCategory] = useState(null);
  const [remoteLoading, setRemoteLoading] = useState(isSupabaseConfigured);
  const [remoteError, setRemoteError] = useState('');
  const [adminUser, setAdminUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  useEffect(() => {
    async function loadCurrentUser() {
      if (!isSupabaseConfigured) return;
      const { data } = await supabase.auth.getUser();
      setAdminUser(data?.user ?? null);
    }

    loadCurrentUser();
  }, []);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [episodeId]);

  const context = useMemo(() => findEpisodeContext(cartoons, episodeId), [cartoons, episodeId]);
  const relatedEpisodes = useMemo(() => {
    if (!context?.category) return [];
    return context.category.episodes.filter((episode) => String(episode.id) !== String(episodeId)).slice(0, 6);
  }, [context, episodeId]);

  useEffect(() => {
    if (!isSupabaseConfigured || !episodeId) {
      return;
    }

    let cancelled = false;
    setRemoteLoading(true);
    setRemoteError('');
    setRemoteEpisode(null);
    setRemoteCartoon(null);
    setRemoteCategory(null);

    async function loadRemoteEpisode() {
      const { data: episode, error: episodeError } = await supabase
        .from('episodes')
        .select('id,cartoon_id,category_id,episode_number,name,description,duration,video_url,thumbnail_url,views,audio_languages')
        .eq('id', episodeId)
        .single();

      if (episodeError || !episode) {
        throw new Error(episodeError?.message || 'Episode not found.');
      }

      const [{ data: cartoon, error: cartoonError }, { data: category, error: categoryError }] = await Promise.all([
        supabase.from('cartoons').select('id,title,description,image_url,rating,year').eq('id', episode.cartoon_id).maybeSingle(),
        supabase.from('categories').select('id,name,order').eq('id', episode.category_id).maybeSingle(),
      ]);

      if (cartoonError || categoryError) {
        console.warn('WatchPage remote metadata fetch failed:', cartoonError || categoryError);
      }

      const safeCartoon = cartoon || {
        id: episode.cartoon_id,
        title: 'Cartoon',
        description: '',
        image_url: episode.thumbnail_url || '',
      };
      const safeCategory = category || {
        id: episode.category_id,
        name: 'Episode',
        order: 0,
      };

      if (!cancelled) {
        setRemoteEpisode(normalizeEpisode(episode, safeCartoon, safeCategory));
        setRemoteCartoon(safeCartoon);
        setRemoteCategory(safeCategory);
      }
    }

    loadRemoteEpisode()
      .catch((error) => {
        if (cancelled) return;
        setRemoteError(error?.message || 'Episode lookup failed.');
        console.warn('WatchPage remote episode fetch failed:', error);
      })
      .finally(() => {
        if (!cancelled) setRemoteLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [episodeId]);

  const derivedFallbackCartoon =
    remoteCartoon ||
    (remoteEpisode ? cartoons.find((cartoon) => String(cartoon.id) === String(remoteEpisode.cartoon_id)) : null);
  const derivedFallbackCategory =
    remoteCategory ||
    (derivedFallbackCartoon && remoteEpisode
      ? derivedFallbackCartoon.categories?.find((category) => String(category.id) === String(remoteEpisode.category_id))
      : null);

  const activeEpisode = context?.episode || remoteEpisode;
  const activeCartoon = context?.cartoon || derivedFallbackCartoon;
  const activeCategory = context?.category || derivedFallbackCategory;
  const activeRelatedEpisodes = context ? relatedEpisodes : [];
  const activeNextEpisode = context?.nextEpisode ?? null;
  const activePreviousEpisode = context?.previousEpisode ?? null;

  function goToEpisode(episode) {
    if (episode?.id) navigate(`/watch/${episode.id}`);
  }

  function parseStoragePathFromUrl(url) {
    try {
      const parsed = new URL(url);
      const match = parsed.pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/);
      if (!match) return null;
      return { bucket: match[1], path: decodeURIComponent(match[2]) };
    } catch (error) {
      return null;
    }
  }

  async function deleteStorageFile(publicUrl) {
    const fileInfo = parseStoragePathFromUrl(publicUrl);
    if (!fileInfo) return;
    const { error } = await supabase.storage.from(fileInfo.bucket).remove([fileInfo.path]);
    if (error) {
      console.warn('Failed to remove storage file:', error.message || error);
    }
  }

  async function handleDeleteEpisode() {
    if (!adminUser) {
      setDeleteError('Sign in on the upload page to delete episodes.');
      return;
    }

    if (!window.confirm('Delete this episode permanently from the site?')) {
      return;
    }

    setDeleteLoading(true);
    setDeleteError('');
    setDeleteSuccess('');

    try {
      const { data: episodeRecord, error: episodeError } = await supabase
        .from('episodes')
        .select('video_url,thumbnail_url')
        .eq('id', episodeId)
        .single();

      if (episodeError || !episodeRecord) {
        throw new Error(episodeError?.message || 'Could not find this episode in the database.');
      }

      if (episodeRecord.video_url) {
        await deleteStorageFile(episodeRecord.video_url);
      }
      if (episodeRecord.thumbnail_url) {
        await deleteStorageFile(episodeRecord.thumbnail_url);
      }

      const { error: deleteErrorResult } = await supabase.from('episodes').delete().eq('id', episodeId);
      if (deleteErrorResult) {
        throw new Error(deleteErrorResult.message || 'Failed to delete the episode record.');
      }

      setDeleteSuccess('Episode deleted successfully. Redirecting to browse...');
      setTimeout(() => navigate('/browse'), 1100);
    } catch (error) {
      setDeleteError(error?.message || 'Delete failed.');
    } finally {
      setDeleteLoading(false);
    }
  }

  const activeDataLoaded = !!activeEpisode;

  if ((loading && !remoteEpisode) || (remoteLoading && !context)) {
    return <p className="soft-status">Loading player...</p>;
  }

  if (!activeDataLoaded) {
    return (
      <section className="empty-state">
        <h1>Episode not found</h1>
        <p>{remoteError || 'The requested episode could not be loaded. Try selecting a different episode.'}</p>
        <Link to="/browse" className="button">
          <ArrowLeft size={18} /> Back to browse
        </Link>
      </section>
    );
  }

  return (
    <section className="watch-screen">
      <div className="watch-nav">
        <Link to={activeCartoon?.id ? `/cartoon/${activeCartoon.id}` : '/browse'} className="btn-link">
          <ArrowLeft size={18} /> {activeCartoon?.title || 'Browse'}
        </Link>
        <span className="badge">
          <Layers size={15} /> {activeCategory?.name || 'Episode'}
        </span>
      </div>

      <AdvancedVideoPlayer
        episode={activeEpisode}
        cartoon={activeCartoon}
        nextEpisode={activeNextEpisode}
        previousEpisode={activePreviousEpisode}
        onNext={() => goToEpisode(activeNextEpisode)}
        onPrevious={() => goToEpisode(activePreviousEpisode)}
      />

      <section className="watch-details">
        <div className="watch-copy">
          <p className="eyebrow">
            {activeCartoon?.title || 'Cartoon'} / Episode {activeEpisode.episode_number}
          </p>
          <h1>{activeEpisode.name}</h1>
          <p>{activeEpisode.description}</p>
          <div className="compact-meta">
            <span>
              <Clock size={15} /> {formatDuration(activeEpisode.duration)}
            </span>
            <span>
              <Eye size={15} /> {activeEpisode.views.toLocaleString()} views
            </span>
            <span>
              <PlayCircle size={15} /> {(activeEpisode.audio_languages || ['English']).join(', ')}
            </span>
          </div>

          {adminUser && (
            <div className="watch-admin-actions">
              <button type="button" className="button" onClick={handleDeleteEpisode} disabled={deleteLoading}>
                {deleteLoading ? 'Deleting…' : 'Delete episode'}
              </button>
              {deleteError && <p className="form-message error">{deleteError}</p>}
              {deleteSuccess && <p className="form-message success">{deleteSuccess}</p>}
            </div>
          )}
        </div>

        {activeNextEpisode && (
          <Link to={`/watch/${activeNextEpisode.id}`} className="up-next-panel">
            <img src={activeNextEpisode.thumbnail_url || activeCartoon.image_url} alt={activeNextEpisode.name} />
            <div>
              <p className="eyebrow">Up next</p>
              <h3>{activeNextEpisode.name}</h3>
              <p>Episode {activeNextEpisode.episode_number}</p>
            </div>
          </Link>
        )}
      </section>

      {activeRelatedEpisodes.length > 0 && (
        <section className="quick-episodes">
          <div className="rail-heading">
            <h2>More from {activeCategory?.name || activeCartoon?.title || 'this series'}</h2>
          </div>
          <div className="quick-episode-grid">
            {activeRelatedEpisodes.map((item) => (
              <Link key={item.id} to={`/watch/${item.id}`} className="episode-list-card">
                <img src={item.thumbnail_url || activeCartoon.image_url} alt={item.name} />
                <div>
                  <p className="eyebrow">Episode {item.episode_number}</p>
                  <h3>{item.name}</h3>
                  <div className="compact-meta">
                    <span>
                      <Clock size={14} /> {formatDuration(item.duration)}
                    </span>
                    <span>
                      <Eye size={14} /> {item.views.toLocaleString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
