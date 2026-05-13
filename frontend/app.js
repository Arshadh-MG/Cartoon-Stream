const { useState, useEffect, useRef } = React;

const styles = `
  :root {
    --primary: #060606;
    --secondary: #131313;
    --card: #1b1b1b;
    --accent: #00ff41;
    --accent-soft: rgba(0, 255, 65, 0.15);
    --text-primary: #ffffff;
    --text-secondary: #b0b0b0;
    --border: #2f2f2f;
    --shadow: rgba(0, 255, 65, 0.12);
  }

  * {
    box-sizing: border-box;
  }

  html, body {
    margin: 0;
    padding: 0;
    min-height: 100%;
    background: radial-gradient(circle at top, rgba(0,255,65,0.12), transparent 35%),
      linear-gradient(180deg, #090909 0%, #060606 100%);
    color: var(--text-primary);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  body {
    overflow-x: hidden;
  }

  .container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 30px 24px 60px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0 24px;
    position: sticky;
    top: 0;
    z-index: 10;
    backdrop-filter: blur(10px);
  }

  .logo {
    font-size: 28px;
    font-weight: 900;
    letter-spacing: 2px;
    color: var(--accent);
    text-transform: uppercase;
  }

  .button {
    border: none;
    background: linear-gradient(135deg, var(--accent), #00d63f);
    color: #060606;
    padding: 13px 22px;
    border-radius: 999px;
    cursor: pointer;
    font-weight: 700;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }

  .button:hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 40px rgba(0, 255, 65, 0.22);
  }

  .hero {
    display: grid;
    grid-template-columns: 1.35fr 1fr;
    gap: 40px;
    align-items: center;
    margin-bottom: 50px;
  }

  .hero-copy {
    max-width: 620px;
  }

  .hero-title {
    font-size: clamp(3rem, 5vw, 4.8rem);
    margin: 0 0 20px;
    line-height: 0.95;
  }

  .hero-subtitle {
    color: var(--text-secondary);
    line-height: 1.8;
    margin-bottom: 28px;
    font-size: 1.05rem;
  }

  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  .hero-panel {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(0, 255, 65, 0.18);
    border-radius: 26px;
    padding: 32px;
    display: grid;
    gap: 18px;
    min-height: 360px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
    animation: float 6s ease-in-out infinite;
  }

  .hero-panel h3 {
    margin: 0 0 12px;
    color: var(--accent);
    letter-spacing: 1px;
    font-size: 1.1rem;
  }

  .hero-panel p {
    margin: 0;
    color: var(--text-secondary);
    line-height: 1.75;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
    margin-top: 10px;
  }

  .stat-card {
    padding: 18px 20px;
    border: 1px solid rgba(0, 255, 65, 0.12);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.02);
  }

  .stat-number {
    font-size: 1.75rem;
    font-weight: 900;
    margin-bottom: 6px;
    color: var(--accent);
  }

  .stat-label {
    color: var(--text-secondary);
    font-size: 0.95rem;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .category-section {
    margin-bottom: 44px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 18px;
  }

  .section-title {
    margin: 0;
    font-size: 1.8rem;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .cards-row {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(280px, 1fr);
    gap: 20px;
    overflow-x: auto;
    padding-bottom: 10px;
    scroll-snap-type: x mandatory;
    scrollbar-width: thin;
  }

  .cards-row::-webkit-scrollbar {
    height: 10px;
  }

  .cards-row::-webkit-scrollbar-thumb {
    background: var(--accent);
    border-radius: 999px;
  }

  .cartoon-card {
    background: var(--card);
    border: 1px solid rgba(0, 255, 65, 0.14);
    border-radius: 24px;
    min-height: 420px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    scroll-snap-align: start;
    animation: float 6s ease-in-out infinite;
  }

  .cartoon-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 0%, rgba(0, 255, 65, 0.06) 100%);
    pointer-events: none;
  }

  .cartoon-card img {
    width: 100%;
    height: 210px;
    object-fit: cover;
    display: block;
  }

  .card-content {
    padding: 22px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
  }

  .card-title {
    margin: 0;
    font-size: 1.4rem;
    line-height: 1.15;
  }

  .card-description {
    margin: 0;
    color: var(--text-secondary);
    line-height: 1.8;
    flex: 1;
  }

  .card-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: auto;
    font-size: 0.95rem;
    color: var(--text-secondary);
  }

  .badge {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    background: rgba(0, 255, 65, 0.08);
    color: var(--accent);
    padding: 8px 12px;
    border-radius: 999px;
    font-size: 0.85rem;
    letter-spacing: 0.5px;
  }

  .admin-modal,
  .detail-modal {
    position: fixed;
    inset: 0;
    z-index: 999;
    background: rgba(0, 0, 0, 0.92);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 24px;
  }

  .modal-panel {
    width: min(980px, 100%);
    max-height: 90vh;
    overflow-y: auto;
    background: #0d0d0d;
    border: 1px solid rgba(0, 255, 65, 0.18);
    border-radius: 28px;
    padding: 28px;
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
  }

  .modal-title {
    font-size: 1.6rem;
    margin: 0;
  }

  .close-btn {
    border: none;
    background: transparent;
    color: var(--text-primary);
    font-size: 1rem;
    cursor: pointer;
    padding: 10px;
  }

  .modal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  .modal-section {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 20px;
    padding: 22px;
  }

  .label {
    display: block;
    margin-bottom: 8px;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-secondary);
  }

  .input,
  .textarea,
  .select {
    width: 100%;
    padding: 12px 14px;
    border-radius: 14px;
    background: #121212;
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: var(--text-primary);
    resize: vertical;
  }

  .textarea {
    min-height: 120px;
  }

  .form-actions {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    margin-top: 18px;
  }

  .small-card {
    padding: 16px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(0, 255, 65, 0.08);
    border-radius: 18px;
  }

  .small-card h4 {
    margin: 0 0 12px;
    color: var(--accent);
  }

  .floating-background {
    position: absolute;
    top: -120px;
    right: -120px;
    width: 260px;
    height: 260px;
    background: radial-gradient(circle, rgba(0,255,65,0.18), transparent 52%);
    filter: blur(30px);
    pointer-events: none;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-12px);
    }
  }

  @media (max-width: 1100px) {
    .hero {
      grid-template-columns: 1fr;
    }

    .modal-grid {
      grid-template-columns: 1fr;
    }
  }
`;

const initialCartoons = [
  {
    id: 1,
    title: 'Ben 10',
    image: 'https://via.placeholder.com/420x250?text=Ben+10',
    description: 'Ben discovers a mysterious device and becomes the hero Ben 10!',
    episodes: 76,
    rating: 8.8,
    categories: ['Featured', 'Action', 'Kids'],
  },
  {
    id: 2,
    title: 'Adventure Time',
    image: 'https://via.placeholder.com/420x250?text=Adventure+Time',
    description: 'Follow Finn and Jake on epic adventures in the Land of Ooo!',
    episodes: 283,
    rating: 8.6,
    categories: ['Featured', 'Fantasy', 'Family'],
  },
  {
    id: 3,
    title: 'Dragon Ball Z',
    image: 'https://via.placeholder.com/420x250?text=Dragon+Ball+Z',
    description: 'Experience the legendary battles of Goku and his friends!',
    episodes: 291,
    rating: 9.0,
    categories: ['Action', 'Adventure'],
  },
  {
    id: 4,
    title: 'Naruto',
    image: 'https://via.placeholder.com/420x250?text=Naruto',
    description: 'Watch Naruto become the greatest ninja in Konoha!',
    episodes: 220,
    rating: 8.9,
    categories: ['Action', 'Anime'],
  },
  {
    id: 5,
    title: 'Spider-Man',
    image: 'https://via.placeholder.com/420x250?text=Spider-Man',
    description: 'Web-slinging action from your friendly neighborhood hero!',
    episodes: 65,
    rating: 8.4,
    categories: ['Featured', 'Superhero'],
  },
  {
    id: 6,
    title: 'Sailor Moon',
    image: 'https://via.placeholder.com/420x250?text=Sailor+Moon',
    description: 'Magical heroes protect the world with heart and courage.',
    episodes: 200,
    rating: 8.2,
    categories: ['Fantasy', 'Classic'],
  },
  {
    id: 7,
    title: 'Pokémon',
    image: 'https://via.placeholder.com/420x250?text=Pok%C3%A9mon',
    description: 'Train, battle, and grow with Pikachu and friends!',
    episodes: 900,
    rating: 8.1,
    categories: ['Kids', 'Adventure'],
  },
];

const initialCategories = [
  { id: 'featured', title: 'Featured', tags: ['Featured'] },
  { id: 'action', title: 'Action & Adventure', tags: ['Action', 'Adventure'] },
  { id: 'fantasy', title: 'Fantasy & Kids', tags: ['Fantasy', 'Kids'] },
  { id: 'classic', title: 'Classic Favorites', tags: ['Classic', 'Superhero'] },
];

function CategorySection({ title, cartoons, onWatchEpisode }) {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    const row = rowRef.current;
    if (!row) return;
    const amount = row.clientWidth * 0.7;
    row.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="category-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        <div>
          <button className="button" onClick={() => scroll('left')} style={{ marginRight: '10px' }}>
            ← Scroll
          </button>
          <button className="button" onClick={() => scroll('right')}>
            Scroll →
          </button>
        </div>
      </div>
      <div className="cards-row" ref={rowRef}>
        {cartoons.map((item) => (
          <div key={item.id} className="cartoon-card">
            <img src={item.image} alt={item.title} />
            <div className="card-content">
              <h3 className="card-title">{item.title}</h3>
              <p className="card-description">{item.description}</p>
              <div className="card-meta">
                <span className="badge">⭐ {item.rating}</span>
                <span className="badge">{item.episodes} eps</span>
              </div>
              {item.latestEpisode && (
                <button className="button" style={{ marginTop: '14px' }} onClick={() => onWatchEpisode(item.latestEpisode)}>
                  Watch Latest
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function LoginPage({ onClose, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (email.trim().toLowerCase() === 'admin@cartoon.com' && password === 'admin123') {
      onLogin();
    } else {
      setError('Invalid email or password. Use admin@cartoon.com / admin123.');
    }
  };

  return (
    <div className="admin-modal">
      <div className="modal-panel">
        <div className="modal-header">
          <h3 className="modal-title">Admin Login</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-section">
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@cartoon.com"
          />
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
          />
          {error && <p style={{ color: '#ff6b6b', marginTop: '10px' }}>{error}</p>}
          <div className="form-actions">
            <button className="button" onClick={handleLogin}>Login</button>
            <button className="button" style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.12)' }} onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminPanel({ onClose, onAddCategory, categories, cartoons, onUploadEpisode }) {
  const [newCategory, setNewCategory] = useState('');
  const [selectedCartoonId, setSelectedCartoonId] = useState(cartoons[0]?.id || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploadEpisodeNumber, setUploadEpisodeNumber] = useState(1);
  const [uploadEpisodeName, setUploadEpisodeName] = useState('Episode 1');
  const [uploadEpisodeDescription, setUploadEpisodeDescription] = useState('');
  const [uploadDuration, setUploadDuration] = useState(1440);

  useEffect(() => {
    setSelectedCartoonId(cartoons[0]?.id || '');
    const firstCartoon = cartoons[0] || {};
    const firstCategory = firstCartoon.categoryDetails?.[0] || firstCartoon.categories?.[0];
    setSelectedCategoryId(firstCategory?.id || firstCategory || '');
  }, [cartoons]);

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    onAddCategory(newCategory.trim());
    setNewCategory('');
  };

  const handleUpload = () => {
    if (!selectedCartoonId || !selectedCategoryId || !videoFile) {
      alert('Please select a cartoon, category, and video file.');
      return;
    }

    onUploadEpisode({
      cartoonId: selectedCartoonId,
      categoryId: selectedCategoryId,
      file: videoFile,
      thumbnail: thumbnailFile,
      episodeNumber: uploadEpisodeNumber,
      name: uploadEpisodeName,
      description: uploadEpisodeDescription,
      duration: uploadDuration,
    });
  };

  const activeCartoon = cartoons.find((cartoon) => String(cartoon.id) === String(selectedCartoonId));
  const categoryOptions = activeCartoon?.categoryDetails || activeCartoon?.categories || [];

  return (
    <div className="admin-modal">
      <div className="modal-panel">
        <div className="modal-header">
          <h3 className="modal-title">Admin Panel</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-grid">
          <div className="modal-section">
            <h4>Upload Episode Video</h4>
            <label className="label">Cartoon</label>
            <select className="select" value={selectedCartoonId} onChange={(e) => setSelectedCartoonId(e.target.value)}>
              {cartoons.map((cartoon) => (
                <option key={cartoon.id} value={cartoon.id}>{cartoon.title}</option>
              ))}
            </select>
            <label className="label">Category</label>
            <select className="select" value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)}>
              {categoryOptions.length > 0 ? (
                categoryOptions.map((cat) => {
                  if (typeof cat === 'string') {
                    return <option key={cat} value={cat}>{cat}</option>;
                  }
                  return <option key={cat.id || cat.name || cat.title} value={cat.id || cat.name || cat.title}>{cat.name || cat.title || 'Category'}</option>;
                })
              ) : (
                <option value="">Add backend categories first</option>
              )}
            </select>
            <label className="label">Episode Name</label>
            <input className="input" value={uploadEpisodeName} onChange={(e) => setUploadEpisodeName(e.target.value)} placeholder="Episode name" />
            <label className="label">Episode Number</label>
            <input className="input" type="number" min="1" value={uploadEpisodeNumber} onChange={(e) => setUploadEpisodeNumber(Number(e.target.value))} />
            <label className="label">Duration (seconds)</label>
            <input className="input" type="number" min="60" value={uploadDuration} onChange={(e) => setUploadDuration(Number(e.target.value))} />
            <label className="label">Video File</label>
            <input className="input" type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} />
            <label className="label">Thumbnail File</label>
            <input className="input" type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files[0])} />
            <label className="label">Episode Description</label>
            <textarea className="textarea" value={uploadEpisodeDescription} onChange={(e) => setUploadEpisodeDescription(e.target.value)} placeholder="Episode description" />
            <div className="form-actions">
              <button className="button" onClick={handleUpload}>Upload Episode</button>
            </div>
          </div>

          <div className="modal-section">
            <h4>Create New Category</h4>
            <div className="small-card">
              <p>New categories let you organize cartoons into scrollable sections.</p>
            </div>
            <label className="label">Category Name</label>
            <input className="input" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="e.g. Sci-Fi" />
            <div className="form-actions">
              <button className="button" onClick={handleAddCategory}>Add Category</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [cartoons, setCartoons] = useState(initialCartoons);
  const [apiCartoons, setApiCartoons] = useState([]);
  const [categories, setCategories] = useState(initialCategories);
  const [adminOpen, setAdminOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState(null);

  useEffect(() => {
    fetch('/api/cartoons')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setApiCartoons(data);
          const updated = data.map((item) => {
            const categoryNames = Array.isArray(item.categories)
              ? item.categories.map((cat) =>
                  typeof cat === 'string' ? cat : cat.name || cat.title || 'Featured'
                )
              : ['Featured'];
            const episodes = Array.isArray(item.episodes) ? item.episodes : [];
            const latestEpisode = episodes[episodes.length - 1] || null;

            return {
              id: item.id,
              title: item.title,
              image: latestEpisode?.thumbnail_url || item.image_url || 'https://via.placeholder.com/420x250?text=Cartoon',
              description: item.description || 'Cartoon series',
              episodes: episodes.length,
              episodeList: episodes,
              latestEpisode,
              rating: item.rating || 8.0,
              categories: categoryNames,
              categoryDetails: item.categories,
            };
          });
          setCartoons(updated);
        }
      })
      .catch(() => {
        // use preset data if backend is unavailable
      });
  }, []);

  const featuredCount = cartoons.filter((item) => item.categories.includes('Featured')).length;
  const adminStats = {
    cartoons: cartoons.length,
    categories: categories.length,
    episodes: cartoons.reduce((sum, item) => sum + (Number(item.episodes) || 0), 0),
  };

  const handleUploadEpisode = async (uploadData) => {
    const {
      cartoonId,
      categoryId,
      file,
      thumbnail,
      episodeNumber,
      name,
      description,
      duration,
    } = uploadData;

    const formData = new FormData();
    formData.append('file', file);
    if (thumbnail) {
      formData.append('thumbnail', thumbnail);
    }
    formData.append('episode_number', episodeNumber);
    formData.append('name', name);
    formData.append('description', description);
    formData.append('duration', duration);

    try {
      const response = await fetch(`/api/cartoons/${cartoonId}/categories/${categoryId}/episodes`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        const errorMessage = result.detail || result.error || JSON.stringify(result);
        throw new Error(errorMessage);
      }
      alert(result.message || 'Episode uploaded successfully');
      window.location.reload();
    } catch (error) {
      const message = typeof error === 'string'
        ? error
        : error?.message || JSON.stringify(error);
      alert(`Upload error: ${message}`);
    }
  };

  const handleAddCategory = (newCategory) => {
    const id = newCategory.toLowerCase().replace(/\s+/g, '-');
    if (categories.some((cat) => cat.id === id)) return;
    setCategories((prev) => [
      ...prev,
      { id, title: newCategory, tags: [newCategory] },
    ]);
  };

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    setLoginOpen(false);
    setAdminOpen(true);
  };

  const openAdmin = () => {
    if (isAdminLoggedIn) {
      setAdminOpen(true);
    } else {
      setLoginOpen(true);
    }
  };

  const sections = categories.map((category) => ({
    ...category,
    cartoons: cartoons.filter((item) =>
      category.tags.some((tag) => item.categories.includes(tag))
    ),
  }));

  return (
    <div className="container">
      <div className="floating-background" />
      <style>{styles}</style>
      <header className="header">
        <div className="logo">🎬 CARTOOFLIX</div>
        <button className="button" onClick={openAdmin}>{isAdminLoggedIn ? 'Open Admin' : 'Admin Login'}</button>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <h1 className="hero-title">A new era for cartoon streaming</h1>
          <p className="hero-subtitle">
            Browse multiple categories, scroll through animated cards, and manage cartoon collections with the working admin panel.
            The frontend now supports multiple category sections, floating animation, and easy upload of new episodes.
          </p>
          <div className="hero-actions">
            <button className="button" onClick={() => document.getElementById('featured-section')?.scrollIntoView({ behavior: 'smooth' })}>
              Browse Featured
            </button>
            <button className="button" onClick={openAdmin}>
              {isAdminLoggedIn ? 'Open Admin' : 'Admin Login'}
            </button>
          </div>
        </div>

        <div className="hero-panel">
          <h3>Live platform stats</h3>
          <p>FastUI experience with scrollable categories, floating animation, and an admin panel that adds cartoons and categories in real time.</p>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{adminStats.cartoons}</div>
              <div className="stat-label">Total Cartoons</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{adminStats.categories}</div>
              <div className="stat-label">Categories</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{featuredCount}</div>
              <div className="stat-label">Featured Picks</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{adminStats.episodes}</div>
              <div className="stat-label">Episode Count</div>
            </div>
          </div>
        </div>
      </section>

      {sections.map((section, index) => (
        <div id={index === 0 ? 'featured-section' : undefined} key={section.id} className="category-section">
          <div className="section-header">
            <h2 className="section-title">{section.title}</h2>
            <button className="button" onClick={() => document.getElementById('featured-section')?.scrollIntoView({ behavior: 'smooth' })}>
              Jump to top
            </button>
          </div>
          <div className="cards-row">
            {section.cartoons.length > 0 ? (
              section.cartoons.map((item) => (
                <div key={item.id} className="cartoon-card">
                  <img src={item.image} alt={item.title} />
                  <div className="card-content">
                    <h3 className="card-title">{item.title}</h3>
                    <p className="card-description">{item.description}</p>
                    <div className="card-meta">
                      <span className="badge">⭐ {item.rating}</span>
                      <span className="badge">{item.episodes} episodes</span>
                    </div>
                    {item.latestEpisode && (
                      <button className="button" style={{ marginTop: '14px' }} onClick={() => setSelectedEpisode(item.latestEpisode)}>
                        Watch Latest
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-secondary)', padding: '20px', minWidth: '280px' }}>
                No cartoons found in this category yet.
              </div>
            )}
          </div>
        </div>
      ))}

      {loginOpen && (
        <LoginPage
          onClose={() => setLoginOpen(false)}
          onLogin={handleAdminLogin}
        />
      )}

      {adminOpen && isAdminLoggedIn && (
        <AdminPanel
          onClose={() => setAdminOpen(false)}
          onAddCategory={handleAddCategory}
          categories={categories}
          cartoons={apiCartoons.length > 0 ? apiCartoons : cartoons}
          onUploadEpisode={handleUploadEpisode}
        />
      )}

      {selectedEpisode && (
        <div className="detail-modal">
          <div className="modal-panel">
            <div className="modal-header">
              <h3 className="modal-title">{selectedEpisode.name}</h3>
              <button className="close-btn" onClick={() => setSelectedEpisode(null)}>&times;</button>
            </div>
            <video
              controls
              style={{ width: '100%', borderRadius: '20px', background: '#000' }}
              src={selectedEpisode.video_path}
              poster={selectedEpisode.thumbnail_url}
            />
            <p style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>{selectedEpisode.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
