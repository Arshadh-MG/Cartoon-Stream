import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Database, Lock, UploadCloud } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../supabaseClient.js';

const defaultValues = {
  cartoonTitle: '',
  cartoonDescription: '',
  imageUrl: '',
  rating: 8.5,
  year: new Date().getFullYear(),
  categoryName: '',
  episodeNumber: 1,
  episodeName: '',
  episodeDescription: '',
  duration: 1320,
};

function cleanFileName(name) {
  return name.replace(/[^a-z0-9._-]/gi, '_').toLowerCase();
}

function loginToEmail(value) {
  const trimmed = value.trim();
  if (trimmed.includes('@')) return trimmed;
  return `${trimmed}@cartoonstream.local`;
}

export default function UploadPage({ user }) {
  const [form, setForm] = useState(defaultValues);
  const [cartoons, setCartoons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCartoon, setSelectedCartoon] = useState('new');
  const [selectedCategory, setSelectedCategory] = useState('new');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [authLogin, setAuthLogin] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [connection, setConnection] = useState({
    state: isSupabaseConfigured ? 'checking' : 'missing',
    message: isSupabaseConfigured ? 'Checking Supabase database...' : 'Supabase environment variables are missing.',
  });

  async function loadAdminData() {
    if (!isSupabaseConfigured) {
      setConnection({ state: 'missing', message: 'Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.' });
      return;
    }

    setConnection({ state: 'checking', message: 'Checking Supabase database...' });
    const { data, error } = await supabase
      .from('cartoons')
      .select('id,title,categories(id)')
      .order('title', { ascending: true });

    if (error) {
      setCartoons([]);
      setConnection({
        state: 'error',
        message: `${error.message}. Run the included supabase-schema.sql file in your Supabase SQL editor.`,
      });
      return;
    }

    const activeCartoons = (data ?? [])
      .filter((cartoon) => (cartoon.categories ?? []).length > 0)
      .map(({ categories: _categories, ...cartoon }) => cartoon);

    setCartoons(activeCartoons);
    setConnection({
      state: 'ready',
      message: `Connected to Supabase. ${activeCartoons.length} active cartoon collections found.`,
    });
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    if (selectedCartoon !== 'new' && !cartoons.some((cartoon) => String(cartoon.id) === String(selectedCartoon))) {
      setSelectedCartoon('new');
    }
  }, [cartoons, selectedCartoon]);

  useEffect(() => {
    async function loadCategories() {
      setCategories([]);
      setSelectedCategory('new');

      if (!isSupabaseConfigured || selectedCartoon === 'new') return;

      const { data, error } = await supabase
        .from('categories')
        .select('id,name,order')
        .eq('cartoon_id', Number(selectedCartoon))
        .order('order', { ascending: true });

      if (!error) {
        setCategories(data ?? []);
      }
    }

    loadCategories();
  }, [selectedCartoon]);

  const isReady = connection.state === 'ready';
  const authEmailPreview = useMemo(() => (authLogin.trim() ? loginToEmail(authLogin) : ''), [authLogin]);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSignIn(event) {
    event.preventDefault();
    setAuthMessage('');
    setAuthLoading(true);

    if (!authLogin.trim() || !authPassword) {
      setAuthMessage('Enter your admin username and password.');
      setAuthLoading(false);
      return;
    }

    if (!isSupabaseConfigured) {
      setAuthMessage('Supabase is not configured.');
      setAuthLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: loginToEmail(authLogin),
      password: authPassword,
    });

    if (error) {
      setAuthMessage(error.message);
    } else {
      setAuthMessage('Signed in successfully. You can upload videos now.');
      setAuthPassword('');
    }

    setAuthLoading(false);
  }

  async function ensureCartoon() {
    if (selectedCartoon !== 'new') return Number(selectedCartoon);

    const title = form.cartoonTitle.trim();
    if (!title) throw new Error('Enter a cartoon title.');

    const payload = {
      title,
      description: form.cartoonDescription.trim(),
      image_url: form.imageUrl.trim(),
      rating: Number(form.rating) || 8.5,
      year: Number(form.year) || new Date().getFullYear(),
    };

    const { data, error } = await supabase.from('cartoons').insert(payload).select('id').single();
    if (error || !data) throw new Error(error?.message || 'Failed to create cartoon.');
    return data.id;
  }

  async function ensureCategory(cartoonId) {
    if (selectedCategory !== 'new') return Number(selectedCategory);

    const name = form.categoryName.trim() || 'Season 1';
    const { data: existing, error: existingError } = await supabase
      .from('categories')
      .select('id')
      .eq('cartoon_id', cartoonId)
      .ilike('name', name)
      .maybeSingle();

    if (existingError) throw new Error(existingError.message);
    if (existing?.id) return existing.id;

    const { data, error } = await supabase
      .from('categories')
      .insert({
        cartoon_id: cartoonId,
        name,
        order: categories.length,
      })
      .select('id')
      .single();

    if (error || !data) throw new Error(error?.message || 'Failed to create category.');
    return data.id;
  }

  async function uploadAsset(bucketPath, file) {
    const { error } = await supabase.storage.from('cartoon-assets').upload(bucketPath, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) throw new Error(error.message);
    return supabase.storage.from('cartoon-assets').getPublicUrl(bucketPath).data.publicUrl;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      if (!user) throw new Error('Sign in with your admin username and password first.');
      if (!isReady) throw new Error(connection.message);
      if (!videoFile) throw new Error('Choose a local video file to upload.');
      if (!form.episodeName.trim()) throw new Error('Enter an episode title.');

      const cartoonId = await ensureCartoon();
      const categoryId = await ensureCategory(cartoonId);
      const stamp = `${Date.now()}-${user.id ?? 'admin'}`;
      const videoPath = `videos/${cartoonId}/${stamp}-${cleanFileName(videoFile.name)}`;
      const thumbnailPath = thumbnailFile ? `thumbnails/${cartoonId}/${stamp}-${cleanFileName(thumbnailFile.name)}` : null;

      const videoUrl = await uploadAsset(videoPath, videoFile);
      const thumbnailUrl = thumbnailFile ? await uploadAsset(thumbnailPath, thumbnailFile) : null;

      if (selectedCartoon === 'new' && thumbnailUrl && !form.imageUrl.trim()) {
        await supabase.from('cartoons').update({ image_url: thumbnailUrl }).eq('id', cartoonId);
      }

      const { error: episodeError } = await supabase.from('episodes').insert({
        cartoon_id: cartoonId,
        category_id: categoryId,
        episode_number: Number(form.episodeNumber) || 1,
        name: form.episodeName.trim(),
        description: form.episodeDescription.trim(),
        duration: Number(form.duration) || 1320,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        views: 0,
      });

      if (episodeError) throw new Error(episodeError.message);

      setMessage('Upload successful. The episode is saved in Supabase and will appear on the website.');
      setForm(defaultValues);
      setVideoFile(null);
      setThumbnailFile(null);
      setSelectedCartoon('new');
      setSelectedCategory('new');
      await loadAdminData();
    } catch (uploadError) {
      setMessage(uploadError.message || 'Upload failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="upload-screen">
      <div className="section-header">
        <div>
          <p className="eyebrow">Admin studio</p>
          <h1 className="page-title">Upload cartoons and episodes</h1>
          <p className="section-subtitle">Sign in with your admin password, upload local videos to Supabase Storage, and save episode metadata into the database.</p>
        </div>
      </div>

      <div className={`status-card ${connection.state}`}>
        {connection.state === 'ready' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
        <div>
          <strong>{connection.state === 'ready' ? 'Supabase connected' : 'Supabase needs attention'}</strong>
          <p>{connection.message}</p>
        </div>
      </div>

      <div className="upload-grid">
        <div className="card admin-card">
          <div className="form-heading">
            <UploadCloud size={20} />
            <h2>Episode uploader</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <label>
              Existing cartoon
              <select value={selectedCartoon} onChange={(event) => setSelectedCartoon(event.target.value)} disabled={!isReady}>
                <option value="new">Create a new cartoon</option>
                {cartoons.map((cartoon) => (
                  <option key={cartoon.id} value={cartoon.id}>
                    {cartoon.title}
                  </option>
                ))}
              </select>
            </label>

            {selectedCartoon !== 'new' && (
              <label>
                Existing category
                <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} disabled={!isReady}>
                  <option value="new">Create or reuse category by name</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {selectedCartoon === 'new' && (
              <>
                <label>
                  Cartoon title
                  <input value={form.cartoonTitle} onChange={(event) => updateField('cartoonTitle', event.target.value)} placeholder="Ben 10" required />
                </label>
                <label>
                  Cover image URL
                  <input value={form.imageUrl} onChange={(event) => updateField('imageUrl', event.target.value)} placeholder="Optional if you upload a thumbnail" />
                </label>
                <label>
                  Description
                  <textarea value={form.cartoonDescription} onChange={(event) => updateField('cartoonDescription', event.target.value)} rows="4" />
                </label>
                <div className="form-pair">
                  <label>
                    Rating
                    <input type="number" min="1" max="10" step="0.1" value={form.rating} onChange={(event) => updateField('rating', Number(event.target.value))} />
                  </label>
                  <label>
                    Year
                    <input type="number" min="1900" max="2035" value={form.year} onChange={(event) => updateField('year', Number(event.target.value))} />
                  </label>
                </div>
              </>
            )}

            <label>
              Category name
              <input value={form.categoryName} onChange={(event) => updateField('categoryName', event.target.value)} placeholder="Classic Series / Season 1 / Movies" />
            </label>

            <label>
              Episode title
              <input value={form.episodeName} onChange={(event) => updateField('episodeName', event.target.value)} placeholder="Episode name" required />
            </label>
            <label>
              Episode description
              <textarea value={form.episodeDescription} onChange={(event) => updateField('episodeDescription', event.target.value)} rows="4" />
            </label>
            <div className="form-pair">
              <label>
                Episode number
                <input type="number" min="1" value={form.episodeNumber} onChange={(event) => updateField('episodeNumber', Number(event.target.value))} required />
              </label>
              <label>
                Duration seconds
                <input type="number" min="30" value={form.duration} onChange={(event) => updateField('duration', Number(event.target.value))} required />
              </label>
            </div>

            <label>
              Local video file
              <input type="file" accept="video/*" onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)} required />
            </label>
            <label>
              Thumbnail image
              <input type="file" accept="image/*" onChange={(event) => setThumbnailFile(event.target.files?.[0] ?? null)} />
            </label>

            <button type="submit" className="button" disabled={loading || !isReady}>
              {loading ? 'Uploading...' : 'Upload to database'}
            </button>

            {message && <p className={message.includes('successful') ? 'form-message success' : 'form-message error'}>{message}</p>}
          </form>
        </div>

        {!user ? (
          <div className="card admin-card">
            <div className="form-heading">
              <Lock size={20} />
              <h2>Admin sign in</h2>
            </div>
            <p className="section-subtitle">Use your Supabase email/password admin account. A username like admin becomes admin@cartoonstream.local.</p>
            <form onSubmit={handleSignIn} className="auth-form">
              <label>
                Username or email
                <input value={authLogin} onChange={(event) => setAuthLogin(event.target.value)} placeholder="admin or admin@example.com" required />
              </label>
              <label>
                Password
                <input type="password" value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} placeholder="Enter admin password" required />
              </label>
              {authEmailPreview && <p className="auth-preview">Signing in as {authEmailPreview}</p>}
              <button className="button" type="submit" disabled={authLoading || !isSupabaseConfigured}>
                {authLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
            {authMessage && <p className={authMessage.includes('successfully') ? 'form-message success' : 'form-message error'}>{authMessage}</p>}
          </div>
        ) : (
          <div className="card admin-card">
            <div className="form-heading">
              <Database size={20} />
              <h2>Database rules</h2>
            </div>
            <p className="section-subtitle">You are signed in as {user.email}. Uploaded videos are saved in the cartoon-assets bucket, then listed from the cartoons, categories, and episodes tables.</p>
            <div className="admin-checklist">
              <span>Storage bucket: cartoon-assets</span>
              <span>Database tables: cartoons, categories, episodes</span>
              <span>Episode playback source: episodes.video_url</span>
            </div>
            <Link to="/admin/videos" className="button" style={{ marginTop: '18px' }}>
              Manage uploaded videos
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
