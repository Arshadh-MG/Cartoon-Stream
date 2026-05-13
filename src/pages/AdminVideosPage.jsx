import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ListVideo, Trash2 } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../supabaseClient.js';
import { formatDuration } from '../lib/catalog.js';

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
  const { categoryId } = useParams();
  const [episodes, setEpisodes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cartoons, setCartoons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyEpisode, setBusyEpisode] = useState(null);
  const [busyCategory, setBusyCategory] = useState(null);

  useEffect(() => {
    async function loadLibrary() {
      setLoading(true);
      setLoadingError('');
      setActionError('');
      setEpisodes([]);
      setCategories([]);
      setCartoons([]);

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
          supabase.from('episodes').select('id,episode_number,name,duration,video_url,thumbnail_url,cartoon_id,category_id,created_at').order('episode_number', { ascending: true }),
          supabase.from('cartoons').select('id,title,image_url'),
          supabase.from('categories').select('id,name,cartoon_id,order').order('order', { ascending: true }),
        ]);

        if (episodesResult.error) throw episodesResult.error;
        if (cartoonsResult.error) throw cartoonsResult.error;
        if (categoriesResult.error) throw categoriesResult.error;

        const cartoonsById = new Map((cartoonsResult.data ?? []).map((item) => [item.id, {
          title: item.title,
          imageUrl: item.image_url,
        }]));
        const categoriesById = new Map((categoriesResult.data ?? []).map((item) => [item.id, item.name]));

        const enrichedEpisodes = (episodesResult.data ?? []).map((episode) => {
          const cartoon = cartoonsById.get(episode.cartoon_id) || {};
          return {
            ...episode,
            cartoonTitle: cartoon.title || 'Unknown cartoon',
            categoryName: categoriesById.get(episode.category_id) || 'Unknown category',
            cartoonImageUrl: cartoon.imageUrl || '',
          };
        });

        setEpisodes(enrichedEpisodes);
        setCategories(categoriesResult.data ?? []);
        setCartoons(cartoonsResult.data ?? []);
      } catch (error) {
        setLoadingError(error?.message || 'Unable to load uploaded videos.');
      } finally {
        setLoading(false);
      }
    }

    loadLibrary();
  }, [user]);

  const selectedCategory = useMemo(
    () => categories.find((category) => String(category.id) === String(categoryId)),
    [categories, categoryId],
  );

  const selectedEpisodes = useMemo(
    () => episodes.filter((episode) => String(episode.category_id) === String(categoryId)),
    [episodes, categoryId],
  );

  const categoryRows = useMemo(() => {
    return categories.map((category) => {
      const categoryEpisodes = episodes.filter((episode) => episode.category_id === category.id);
      const cartoon = cartoons.find((item) => item.id === category.cartoon_id) || {};
      return {
        ...category,
        cartoonTitle: cartoon.title || 'Unknown',
        imageUrl: categoryEpisodes[0]?.thumbnail_url || cartoon.image_url || '',
        episodeCount: categoryEpisodes.length,
      };
    });
  }, [categories, cartoons, episodes]);

  async function handleDeleteEpisode(episode) {
    if (!user) {
      setActionError('Sign in first on the upload page.');
      return;
    }

    setActionError('');
    setBusyEpisode(episode.id);

    try {
      if (episode.video_url) await deleteStorageFile(episode.video_url);
      if (episode.thumbnail_url) await deleteStorageFile(episode.thumbnail_url);

      const { error } = await supabase.from('episodes').delete().eq('id', episode.id);
      if (error) throw error;

      setEpisodes((current) => current.filter((item) => item.id !== episode.id));
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

    setActionError('');
    setBusyCategory(category.id);

    try {
      const categoryEpisodes = episodes.filter((episode) => episode.category_id === category.id);
      const remainingCategories = categories.filter((item) => item.cartoon_id === category.cartoon_id && item.id !== category.id);

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
        setCartoons((current) => current.filter((cartoon) => cartoon.id !== category.cartoon_id));
      }

      setCategories((current) => current.filter((item) => item.id !== category.id));
      setEpisodes((current) => current.filter((episode) => episode.category_id !== category.id));
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
          <h1 className="page-title">{categoryId ? 'Delete category episodes' : 'Manage uploaded videos'}</h1>
          <p className="section-subtitle">
            {categoryId
              ? `Remove individual episodes from ${selectedCategory?.name || 'this category'}.`
              : 'Choose a category, delete the whole category, or open its episode delete page.'}
          </p>
        </div>
        <div className="admin-actions-row">
          {categoryId && (
            <Link to="/admin/videos" className="btn-secondary">
              <ArrowLeft size={18} /> Back to categories
            </Link>
          )}
          <Link to="/upload" className="button">
            Back to upload admin
          </Link>
        </div>
      </div>

      <div className="card admin-card">
        {loading && <p className="soft-status">Loading uploaded videos...</p>}
        {loadingError && <p className="form-message error">{loadingError}</p>}
        {actionError && <p className="form-message error">{actionError}</p>}

        {!loading && !categoryId && categoryRows.length === 0 && !loadingError && (
          <p className="soft-status">No uploaded categories were found.</p>
        )}

        {!loading && !categoryId && categoryRows.length > 0 && (
          <div className="admin-category-list">
            <div className="admin-category-row admin-category-header">
              <span>Image</span>
              <span>Category</span>
              <span>Cartoon</span>
              <span>Episodes</span>
              <span className="category-actions-cell">Actions</span>
            </div>
            {categoryRows.map((category) => (
              <div key={category.id} className="admin-category-row">
                <span className="category-image-cell">
                  <div className="category-thumbnail-preview">
                    {category.imageUrl ? (
                      <img src={category.imageUrl} alt={`${category.name} thumbnail`} loading="lazy" />
                    ) : (
                      <div className="thumbnail-placeholder">No image</div>
                    )}
                  </div>
                </span>
                <span>{category.name}</span>
                <span>{category.cartoonTitle}</span>
                <span>{category.episodeCount}</span>
                <span className="category-actions-cell split-actions">
                  <button
                    type="button"
                    className="button button-secondary button-danger"
                    onClick={() => handleDeleteCategory(category)}
                    disabled={busyCategory === category.id}
                  >
                    <Trash2 size={17} /> {busyCategory === category.id ? 'Deleting...' : 'Delete category'}
                  </button>
                  <Link to={`/admin/videos/category/${category.id}`} className="btn-secondary">
                    <ListVideo size={17} /> Delete episodes
                  </Link>
                </span>
              </div>
            ))}
          </div>
        )}

        {!loading && categoryId && !selectedCategory && !loadingError && (
          <p className="soft-status">This category was not found.</p>
        )}

        {!loading && categoryId && selectedCategory && selectedEpisodes.length === 0 && (
          <p className="soft-status">No episodes are inside this category.</p>
        )}

        {!loading && categoryId && selectedEpisodes.length > 0 && (
          <div className="admin-video-list">
            <div className="admin-video-row admin-video-header">
              <span className="thumbnail-cell">Thumbnail</span>
              <span>Cartoon</span>
              <span>Episode</span>
              <span>Duration</span>
              <span>Created</span>
              <span className="actions-cell">Actions</span>
            </div>
            {selectedEpisodes.map((episode) => (
              <div key={episode.id} className="admin-video-row episode-delete-row">
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
                <span>{formatDuration(episode.duration)}</span>
                <span>{new Date(episode.created_at).toLocaleDateString()}</span>
                <span className="actions-cell">
                  <button
                    type="button"
                    className="button button-secondary button-danger"
                    onClick={() => handleDeleteEpisode(episode)}
                    disabled={busyEpisode === episode.id}
                  >
                    <Trash2 size={17} /> {busyEpisode === episode.id ? 'Deleting...' : 'Delete'}
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
