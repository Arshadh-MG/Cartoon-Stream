import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Eye, Layers, MessageCircle, PlayCircle, Send, ThumbsDown, ThumbsUp } from 'lucide-react';
import AdvancedVideoPlayer from '../components/AdvancedVideoPlayer.jsx';
import { fetchCatalog, findEpisodeContext, formatDuration, normalizeEpisode } from '../lib/catalog.js';
import { isSupabaseConfigured, supabase } from '../supabaseClient.js';

function getFeedbackKey(episodeId) {
  return `cartoonstream-feedback-${episodeId}`;
}

function normalizeFeedback(saved = {}) {
  return {
    reaction: saved.reaction || null,
    likeCount: Math.max(0, Number(saved.likeCount || 0)),
    unlikeCount: Math.max(0, Number(saved.unlikeCount || 0)),
    comments: Array.isArray(saved.comments) ? saved.comments : [],
  };
}

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
  const [feedback, setFeedback] = useState(() => normalizeFeedback());
  const [commentDraft, setCommentDraft] = useState('');
  const [commentsOpen, setCommentsOpen] = useState(true);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(getFeedbackKey(episodeId)) || '{}');
      setFeedback(normalizeFeedback(saved));
    } catch (error) {
      setFeedback(normalizeFeedback());
    }

    setCommentDraft('');
    setCommentsOpen(true);
  }, [episodeId]);

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
        const isNetworkError = error?.message?.includes('Failed to fetch') || error?.code === 'NETWORK_ERROR';
        const message = isNetworkError
          ? 'Unable to connect to Supabase. Check your internet connection and Supabase project settings (URL, key, tables, and auth). Using local catalog instead.'
          : error?.message || 'Episode lookup failed. Using local catalog instead.';
        setRemoteError(message);
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

  function saveFeedback(nextFeedback) {
    setFeedback(nextFeedback);
    localStorage.setItem(getFeedbackKey(episodeId), JSON.stringify(nextFeedback));
  }

  function handleReaction(reaction) {
    const nextFeedback = normalizeFeedback(feedback);
    const previousReaction = nextFeedback.reaction;

    if (previousReaction === reaction) {
      nextFeedback.reaction = null;
      if (reaction === 'like') nextFeedback.likeCount = Math.max(0, nextFeedback.likeCount - 1);
      if (reaction === 'unlike') nextFeedback.unlikeCount = Math.max(0, nextFeedback.unlikeCount - 1);
      saveFeedback(nextFeedback);
      return;
    }

    if (previousReaction === 'like') nextFeedback.likeCount = Math.max(0, nextFeedback.likeCount - 1);
    if (previousReaction === 'unlike') nextFeedback.unlikeCount = Math.max(0, nextFeedback.unlikeCount - 1);
    if (reaction === 'like') nextFeedback.likeCount += 1;
    if (reaction === 'unlike') nextFeedback.unlikeCount += 1;
    nextFeedback.reaction = reaction;
    saveFeedback(nextFeedback);
  }

  function handleCommentSubmit(event) {
    event.preventDefault();
    const text = commentDraft.trim();
    if (!text) return;

    saveFeedback({
      ...feedback,
      comments: [
        {
          id: Date.now(),
          text,
          createdAt: new Date().toISOString(),
        },
        ...feedback.comments,
      ],
    });
    setCommentDraft('');
    setCommentsOpen(true);
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

          <div className="watch-engagement" aria-label="Episode feedback">
            <button
              type="button"
              className={`reaction-button ${feedback.reaction === 'like' ? 'active' : ''}`}
              onClick={() => handleReaction('like')}
              aria-pressed={feedback.reaction === 'like'}
            >
              <ThumbsUp size={18} /> <span>Like</span> <strong>{feedback.likeCount}</strong>
            </button>
            <button
              type="button"
              className={`reaction-button ${feedback.reaction === 'unlike' ? 'active' : ''}`}
              onClick={() => handleReaction('unlike')}
              aria-pressed={feedback.reaction === 'unlike'}
            >
              <ThumbsDown size={18} /> <span>Unlike</span> <strong>{feedback.unlikeCount}</strong>
            </button>
            <button
              type="button"
              className={`reaction-button ${commentsOpen ? 'active' : ''}`}
              onClick={() => setCommentsOpen((current) => !current)}
              aria-expanded={commentsOpen}
            >
              <MessageCircle size={18} /> <span>Comment</span> <strong>{feedback.comments.length}</strong>
            </button>
          </div>

          {commentsOpen && (
            <section className="comment-panel" aria-label="Comments">
              <div className="comment-panel-heading">
                <h2>{feedback.comments.length} comments</h2>
                <p>Share your thoughts about this episode.</p>
              </div>
              <form className="comment-form" onSubmit={handleCommentSubmit}>
                <label>
                  Add comment
                  <textarea value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} rows="3" placeholder="Write your comment" />
                </label>
                <button type="submit" className="button">
                  <Send size={17} /> Post comment
                </button>
              </form>
              {feedback.comments.length > 0 && (
                <div className="comment-list">
                  {feedback.comments.map((comment) => (
                    <article key={comment.id} className="comment-item">
                      <p>{comment.text}</p>
                      <span>{new Date(comment.createdAt).toLocaleString()}</span>
                    </article>
                  ))}
                </div>
              )}
              {feedback.comments.length === 0 && <p className="soft-status">No comments yet.</p>}
            </section>
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
