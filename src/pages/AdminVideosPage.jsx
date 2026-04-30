import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../supabaseClient.js';

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
    console.warn('Failed to delete storage file:', error.message || error);
  }
}

export default function AdminVideosPage({ user }) {
  const [episodes, setEpisodes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cartoons, setCartoons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [busyEpisode, setBusyEpisode] = useState(null);
  const [busyCategory, setBusyCategory] = useState(null);

  useEffect(() => {
    async function loadEpisodes() {
      setLoading(true);
      setLoadingError('');
      setEpisodes([]);

      if (!user) {
        setLoading(false);
        return;
      }

      if (!isSupabaseConfigured) {
        setLoadingError('Supabase is not configured.');
        setLoading(false);
        return;
      }

      try {
        const [episodesResult, cartoonsResult, categoriesResult] = await Promise.all([
          supabase.from('episodes').select('id,episode_number,name,duration,video_url,thumbnail_url,cartoon_id,category_id,created_at').order('created_at', { ascending: false }),
          supabase.from('cartoons').select('id,title,image_url'),
          supabase.from('categories').select('id,name,cartoon_id'),
        ]);

        if (episodesResult.error) throw episodesResult.error;
        if (cartoonsResult.error) throw cartoonsResult.error;
        if (categoriesResult.error) throw categoriesResult.error;

        const cartoonsById = new Map((cartoonsResult.data ?? []).map((item) => [item.id, {
          title: item.title,
          imageUrl: item.image_url,
        }]));
        const categoriesById = new Map((categoriesResult.data ?? []).map((item) => [item.id, item.name]));

        const enriched = (episodesResult.data ?? []).map((episode) => {
          const cartoon = cartoonsById.get(episode.cartoon_id) || {};
          return {
            ...episode,
            cartoonTitle: cartoon.title || 'Unknown cartoon',
            categoryName: categoriesById.get(episode.category_id) || 'Unknown category',
            cartoonImageUrl: cartoon.imageUrl || '',
          };
        });

        setEpisodes(enriched);
        setCategories(categoriesResult.data ?? []);
        setCartoons(cartoonsResult.data ?? []);
      } catch (error) {
        setLoadingError(error?.message || 'Unable to load uploaded videos.');
      } finally {
        setLoading(false);
      }
    }

    loadEpisodes();
  }, [user]);

  async function handleDelete(episode) {
    if (!user) {
      setActionError('Sign in first on the upload page.');
      return;
    }

    if (!window.confirm(`Delete episode "${episode.name}" permanently?`)) {
      return;
    }

    setActionError('');
    setActionSuccess('');
    setBusyEpisode(episode.id);

    try {
      if (episode.video_url) await deleteStorageFile(episode.video_url);
      if (episode.thumbnail_url) await deleteStorageFile(episode.thumbnail_url);

      const { error } = await supabase.from('episodes').delete().eq('id', episode.id);
      if (error) throw error;

      setEpisodes((current) => current.filter((item) => item.id !== episode.id));
      setActionSuccess(`Deleted episode “${episode.name}”.`);
    } catch (error) {
      setActionError(error?.message || 'Failed to delete episode.');
    } finally {
      setBusyEpisode(null);
    }
  }

  async function handleDeleteCategory(category) {
    if (!user) {
      setActionError('Sign in first on the upload page.');
      return;
    }

    if (!window.confirm(`Delete category "${category.name}" and all its episodes permanently?`)) {
      return;
    }

    setActionError('');
    setActionSuccess('');
    setBusyCategory(category.id);

    try {
      const categoryEpisodes = episodes.filter((episode) => episode.category_id === category.id);
      const remainingCategories = categories.filter((item) => item.cartoon_id === category.cartoon_id && item.id !== category.id);
      let removedEmptyCartoon = false;

      await Promise.all(
        categoryEpisodes.map(async (episode) => {
          if (episode.video_url) await deleteStorageFile(episode.video_url);
          if (episode.thumbnail_url) await deleteStorageFile(episode.thumbnail_url);
        }),
      );

      const { error } = await supabase.from('categories').delete().eq('id', category.id);
      if (error) throw error;

      if (remainingCategories.length === 0) {
        const { error: cartoonError } = await supabase.from('cartoons').delete().eq('id', category.cartoon_id);
        if (cartoonError) throw cartoonError;
        removedEmptyCartoon = true;
      }

      setCategories((current) => current.filter((item) => item.id !== category.id));
      setEpisodes((current) => current.filter((episode) => episode.category_id !== category.id));
      if (removedEmptyCartoon) {
        setCartoons((current) => current.filter((cartoon) => cartoon.id !== category.cartoon_id));
      }
      setActionSuccess(`Deleted category “${category.name}” and its episodes.`);
      if (removedEmptyCartoon) {
        setActionSuccess(`Deleted category "${category.name}", its episodes, and the empty cartoon collection.`);
      }
    } catch (error) {
      setActionError(error?.message || 'Failed to delete category.');
    } finally {
      setBusyCategory(null);
    }
  }

  if (!user) {
    return (
      <section className="admin-videos-screen">
        <div className="section-header">
          <div>
            <p className="eyebrow">Admin management</p>
            <h1 className="page-title">Uploaded video library</h1>
            <p className="section-subtitle">Sign in on the upload page first to manage your uploaded videos.</p>
          </div>
        </div>

        <div className="card admin-card">
          <p className="form-message error">You are not signed in as an admin.</p>
          <Link to="/upload" className="button" style={{ marginTop: '18px' }}>
            Go to admin upload page
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-videos-screen">
      <div className="section-header">
        <div>
          <p className="eyebrow">Admin management</p>
          <h1 className="page-title">Uploaded videos</h1>
          <p className="section-subtitle">Review all uploaded episodes and remove any video from both the database and storage.</p>
        </div>
        <div className="admin-actions-row">
          <Link to="/upload" className="button">
            Back to upload admin
          </Link>
        </div>
      </div>

      <div className="card admin-card">
        {loading && <p className="soft-status">Loading uploaded videos…</p>}
        {loadingError && <p className="form-message error">{loadingError}</p>}
        {actionError && <p className="form-message error">{actionError}</p>}
        {actionSuccess && <p className="form-message success">{actionSuccess}</p>}

        {!loading && episodes.length === 0 && !loadingError && (
          <p className="soft-status">No uploaded videos were found.</p>
        )}

        {!loading && episodes.length > 0 && (
          <div className="admin-video-list">
            <div className="admin-video-row admin-video-header">
              <span className="thumbnail-cell">Thumbnail</span>
              <span>Cartoon</span>
              <span>Episode</span>
              <span>Category</span>
              <span>Duration</span>
              <span>Created</span>
              <span className="actions-cell">Actions</span>
            </div>
            {episodes.map((episode) => (
              <div key={episode.id} className="admin-video-row">
                <span className="thumbnail-cell">
                  <div className="thumbnail-preview">
                    {episode.thumbnail_url || episode.cartoonImageUrl ? (
                      <img
                        src={episode.thumbnail_url || episode.cartoonImageUrl}
                        alt={episode.name ? `${episode.name} thumbnail` : 'Episode thumbnail'}
                        loading="lazy"
                      />
                    ) : (
                      <div className="thumbnail-placeholder">No image</div>
                    )}
                  </div>
                </span>
                <span>{episode.cartoonTitle}</span>
                <span>{episode.episode_number}. {episode.name}</span>
                <span>{episode.categoryName}</span>
                <span>{episode.duration}s</span>
                <span>{new Date(episode.created_at).toLocaleDateString()}</span>
                <span className="actions-cell">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => handleDelete(episode)}
                    disabled={busyEpisode === episode.id}
                  >
                    {busyEpisode === episode.id ? 'Deleting…' : 'Delete'}
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}

        {!loading && categories.length > 0 && (
          <div className="admin-category-section">
            <h2 className="section-subtitle" style={{ marginTop: '24px' }}>Categories</h2>
            <div className="admin-category-list">
              <div className="admin-category-row admin-category-header">
                <span>Image</span>
                <span>Category</span>
                <span>Cartoon</span>
                <span>Episodes</span>
                <span className="category-actions-cell">Actions</span>
              </div>
              {categories.map((category) => {
                const episodeCount = episodes.filter((episode) => episode.category_id === category.id).length;
                const cartoon = cartoons.find((cartoon) => cartoon.id === category.cartoon_id) || {};
                const categoryImage = episodes.find((episode) => episode.category_id === category.id)?.thumbnail_url || cartoon.image_url;
                const cartoonTitle = cartoon.title || 'Unknown';
                return (
                  <div key={category.id} className="admin-category-row">
                    <span className="category-image-cell">
                      <div className="category-thumbnail-preview">
                        {categoryImage ? (
                          <img src={categoryImage} alt={`${category.name} icon`} loading="lazy" />
                        ) : (
                          <div className="thumbnail-placeholder">No image</div>
                        )}
                      </div>
                    </span>
                    <span>{category.name}</span>
                    <span>{cartoonTitle}</span>
                    <span>{episodeCount}</span>
                    <span className="category-actions-cell">
                      <button
                        type="button"
                        className="button button-secondary"
                        onClick={() => handleDeleteCategory(category)}
                        disabled={busyCategory === category.id}
                      >
                        {busyCategory === category.id ? 'Deleting…' : 'Delete category'}
                      </button>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
