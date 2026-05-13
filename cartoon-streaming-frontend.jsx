import React, { useState, useEffect, useRef } from 'react';
import { Play, ChevronLeft, ChevronRight, Settings, Volume2, Clock, Eye } from 'lucide-react';

// ============================================================================
// CARTOON STREAMING PLATFORM - PRODUCTION GRADE
// Dark theme with neon green accents, smooth animations, advanced features
// ============================================================================

const API_BASE = 'http://localhost:8000/api';

// Styles Component
const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :root {
    --primary: #0a0a0a;
    --secondary: #1a1a1a;
    --tertiary: #2d2d2d;
    --accent: #00ff41;
    --accent-dark: #00cc33;
    --text-primary: #ffffff;
    --text-secondary: #b0b0b0;
    --border: #333333;
  }

  body {
    background: var(--primary);
    color: var(--text-primary);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    overflow-x: hidden;
  }

  /* ANIMATIONS */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-40px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
    }
    50% {
      box-shadow: 0 0 40px rgba(0, 255, 65, 0.6);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  /* SCROLLBAR */
  ::-webkit-scrollbar {
    width: 10px;
  }

  ::-webkit-scrollbar-track {
    background: var(--primary);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--accent);
    border-radius: 5px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--accent-dark);
  }
`;

// ============================================================================
// HEADER COMPONENT
// ============================================================================
const Header = ({ onAdminClick }) => {
  return (
    <header className="header">
      <style>{`
        .header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: linear-gradient(180deg, var(--primary) 0%, rgba(10, 10, 10, 0.8) 100%);
          border-bottom: 2px solid var(--accent);
          padding: 20px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          backdrop-filter: blur(10px);
          animation: slideIn 0.6s ease-out;
        }

        .logo {
          font-size: 28px;
          font-weight: 900;
          letter-spacing: 3px;
          background: linear-gradient(135deg, var(--accent) 0%, #00ff7f 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-transform: uppercase;
          cursor: pointer;
          transition: transform 0.3s;
        }

        .logo:hover {
          transform: scale(1.05);
        }

        .admin-btn {
          background: var(--accent);
          color: var(--primary);
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 1px;
        }

        .admin-btn:hover {
          background: var(--accent-dark);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 255, 65, 0.3);
        }
      `}</style>

      <div className="logo">🎬 CARTOOFLIX</div>
      <button className="admin-btn" onClick={onAdminClick}>Admin Panel</button>
    </header>
  );
};

// ============================================================================
// CAROUSEL COMPONENT
// ============================================================================
const Carousel = ({ cartoons }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    if (!isAutoPlay || cartoons.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cartoons.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay, cartoons.length]);

  const slide = cartoons[currentIndex];

  return (
    <div className="carousel">
      <style>{`
        .carousel {
          position: relative;
          width: 100%;
          height: 500px;
          overflow: hidden;
          background: var(--secondary);
          border-bottom: 3px solid var(--accent);
          animation: fadeInUp 0.8s ease-out;
        }

        .carousel-content {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          padding: 60px 80px;
          background: linear-gradient(135deg, rgba(0, 255, 65, 0.1) 0%, transparent 100%);
          animation: fadeInUp 0.6s ease-out;
        }

        .carousel-text {
          max-width: 600px;
          z-index: 10;
        }

        .carousel-title {
          font-size: 56px;
          font-weight: 900;
          margin-bottom: 20px;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 2px;
          line-height: 1.2;
        }

        .carousel-description {
          font-size: 18px;
          color: var(--text-secondary);
          margin-bottom: 30px;
          line-height: 1.6;
        }

        .carousel-buttons {
          display: flex;
          gap: 20px;
        }

        .carousel-btn {
          padding: 14px 32px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .carousel-btn-primary {
          background: var(--accent);
          color: var(--primary);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .carousel-btn-primary:hover {
          background: var(--accent-dark);
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(0, 255, 65, 0.4);
        }

        .carousel-btn-secondary {
          background: transparent;
          border: 2px solid var(--accent);
          color: var(--accent);
        }

        .carousel-btn-secondary:hover {
          background: var(--accent);
          color: var(--primary);
          transform: translateY(-3px);
        }

        .carousel-controls {
          position: absolute;
          bottom: 40px;
          left: 80px;
          display: flex;
          gap: 15px;
          z-index: 10;
        }

        .carousel-nav {
          width: 48px;
          height: 48px;
          background: rgba(0, 255, 65, 0.2);
          border: 2px solid var(--accent);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          color: var(--accent);
          font-size: 20px;
        }

        .carousel-nav:hover {
          background: var(--accent);
          color: var(--primary);
          transform: scale(1.1);
        }

        .carousel-indicator {
          display: flex;
          gap: 10px;
          position: absolute;
          bottom: 40px;
          right: 80px;
          z-index: 10;
        }

        .indicator-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          cursor: pointer;
          transition: all 0.3s;
          border: 2px solid transparent;
        }

        .indicator-dot.active {
          background: var(--accent);
          transform: scale(1.3);
          border-color: var(--accent);
        }
      `}</style>

      {slide && (
        <div className="carousel-content">
          <div className="carousel-text">
            <h1 className="carousel-title">{slide.title}</h1>
            <p className="carousel-description">{slide.description}</p>
            <div className="carousel-buttons">
              <button className="carousel-btn carousel-btn-primary">
                <Play size={20} /> Watch Now
              </button>
              <button className="carousel-btn carousel-btn-secondary">
                Learn More
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="carousel-controls">
        <button
          className="carousel-nav"
          onClick={() => setCurrentIndex((prev) => (prev - 1 + cartoons.length) % cartoons.length)}
        >
          ◀
        </button>
        <button
          className="carousel-nav"
          onClick={() => setCurrentIndex((prev) => (prev + 1) % cartoons.length)}
        >
          ▶
        </button>
      </div>

      <div className="carousel-indicator">
        {cartoons.map((_, idx) => (
          <div
            key={idx}
            className={`indicator-dot ${idx === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(idx)}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// CARTOON CARD COMPONENT
// ============================================================================
const CartoonCard = ({ cartoon, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="cartoon-card">
      <style>{`
        .cartoon-card {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.320, 1);
          aspect-ratio: 16 / 9;
          background: var(--secondary);
          border: 2px solid transparent;
        }

        .cartoon-card:hover {
          transform: translateY(-12px) scale(1.05);
          border-color: var(--accent);
          box-shadow: 0 20px 50px rgba(0, 255, 65, 0.3);
        }

        .cartoon-card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s;
        }

        .cartoon-card:hover .cartoon-card-image {
          transform: scale(1.1);
        }

        .cartoon-card-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.9) 100%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 20px;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .cartoon-card:hover .cartoon-card-overlay {
          opacity: 1;
        }

        .cartoon-card-title {
          color: var(--accent);
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .cartoon-card-meta {
          display: flex;
          gap: 15px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .play-button {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          background: var(--accent);
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          transition: all 0.3s;
          z-index: 10;
        }

        .cartoon-card:hover .play-button {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1.1);
        }

        .play-button:hover {
          background: var(--accent-dark);
          transform: translate(-50%, -50%) scale(1.2);
        }

        .play-button svg {
          color: var(--primary);
          margin-left: 4px;
        }
      `}</style>

      <img
        src={cartoon.image || 'https://via.placeholder.com/400x225?text=Cartoon'}
        alt={cartoon.title}
        className="cartoon-card-image"
      />

      <button className="play-button" onClick={onClick}>
        <Play size={28} fill="currentColor" />
      </button>

      <div className="cartoon-card-overlay">
        <div className="cartoon-card-title">{cartoon.title}</div>
        <div className="cartoon-card-meta">
          <span>📺 {cartoon.episodes || 0} Episodes</span>
          <span>⭐ {cartoon.rating || 8.5}/10</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// CATEGORY SECTION
// ============================================================================
const CategorySection = ({ title, cartoons, onCartoonSelect }) => {
  const [scrollPos, setScrollPos] = useState(0);
  const scrollContainer = useRef(null);

  const scroll = (direction) => {
    const container = scrollContainer.current;
    const scrollAmount = 400;
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="category-section">
      <style>{`
        .category-section {
          padding: 60px 40px;
          background: var(--primary);
          border-bottom: 1px solid var(--border);
          animation: fadeInUp 0.8s ease-out;
        }

        .category-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 30px;
        }

        .category-title {
          font-size: 28px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--text-primary);
          position: relative;
          padding-bottom: 10px;
        }

        .category-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 50px;
          height: 4px;
          background: var(--accent);
          border-radius: 2px;
        }

        .scroll-nav {
          display: flex;
          gap: 15px;
        }

        .scroll-btn {
          width: 44px;
          height: 44px;
          background: var(--accent);
          border: none;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          color: var(--primary);
          font-weight: bold;
          font-size: 18px;
        }

        .scroll-btn:hover {
          background: var(--accent-dark);
          transform: scale(1.1);
        }

        .cartoons-scroll {
          display: flex;
          gap: 20px;
          overflow-x: auto;
          scroll-behavior: smooth;
          padding-bottom: 10px;
          scroll-padding: 0 40px;
        }

        .cartoon-wrapper {
          flex: 0 0 calc(25% - 15px);
          min-width: 280px;
        }

        @media (max-width: 1400px) {
          .cartoon-wrapper {
            flex: 0 0 calc(33.333% - 15px);
            min-width: 220px;
          }
        }

        @media (max-width: 900px) {
          .cartoon-wrapper {
            flex: 0 0 calc(50% - 10px);
            min-width: 160px;
          }
        }
      `}</style>

      <div className="category-header">
        <h2 className="category-title">{title}</h2>
        <div className="scroll-nav">
          <button className="scroll-btn" onClick={() => scroll('left')}>←</button>
          <button className="scroll-btn" onClick={() => scroll('right')}>→</button>
        </div>
      </div>

      <div className="cartoons-scroll" ref={scrollContainer}>
        {cartoons.map((cartoon) => (
          <div key={cartoon.id} className="cartoon-wrapper">
            <CartoonCard cartoon={cartoon} onClick={() => onCartoonSelect(cartoon)} />
          </div>
        ))}
      </div>
    </section>
  );
};

// ============================================================================
// ADVANCED VIDEO PLAYER
// ============================================================================
const VideoPlayer = ({ episode, onClose, cartoon }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(100);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedAudio, setSelectedAudio] = useState('english');
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsTimeout = useRef(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgressChange = (e) => {
    const newTime = (e.target.value / 100) * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const toggleFullscreen = () => {
    if (videoRef.current?.parentElement) {
      if (!document.fullscreenElement) {
        videoRef.current.parentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="video-player-modal">
      <style>{`
        .video-player-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.95);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          animation: fadeInUp 0.4s ease-out;
        }

        .player-header {
          padding: 20px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border);
          background: var(--primary);
        }

        .player-title {
          color: var(--accent);
          font-size: 20px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .close-btn {
          background: var(--accent);
          border: none;
          color: var(--primary);
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s;
        }

        .close-btn:hover {
          background: var(--accent-dark);
          transform: scale(1.05);
        }

        .player-container {
          flex: 1;
          position: relative;
          background: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: all 0.3s;
        }

        .video-element {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .player-controls {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.9) 100%);
          padding: 40px 20px 20px 20px;
          opacity: ${showControls ? 1 : 0};
          transition: opacity 0.3s;
          pointer-events: ${showControls ? 'auto' : 'none'};
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: var(--border);
          border-radius: 3px;
          margin-bottom: 15px;
          cursor: pointer;
          position: relative;
          appearance: none;
          -webkit-appearance: none;
        }

        .progress-bar::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          background: var(--accent);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
        }

        .progress-bar::-moz-range-thumb {
          width: 14px;
          height: 14px;
          background: var(--accent);
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
        }

        .controls-bottom {
          display: flex;
          align-items: center;
          gap: 15px;
          justify-content: space-between;
        }

        .controls-left {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .control-btn {
          background: transparent;
          border: none;
          color: var(--accent);
          cursor: pointer;
          font-size: 18px;
          transition: all 0.3s;
          padding: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .control-btn:hover {
          color: var(--accent-dark);
          transform: scale(1.15);
        }

        .time-display {
          color: var(--text-secondary);
          font-size: 13px;
          min-width: 100px;
          font-family: 'Courier New', monospace;
        }

        .volume-control {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .volume-slider {
          width: 80px;
          height: 4px;
          appearance: none;
          -webkit-appearance: none;
          background: var(--border);
          border-radius: 2px;
          cursor: pointer;
        }

        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 10px;
          height: 10px;
          background: var(--accent);
          border-radius: 50%;
          cursor: pointer;
        }

        .volume-slider::-moz-range-thumb {
          width: 10px;
          height: 10px;
          background: var(--accent);
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }

        .settings-menu {
          position: absolute;
          bottom: 80px;
          right: 20px;
          background: var(--secondary);
          border: 1px solid var(--accent);
          border-radius: 4px;
          overflow: hidden;
          z-index: 10;
          min-width: 200px;
          animation: fadeInUp 0.2s ease-out;
        }

        .settings-group {
          border-bottom: 1px solid var(--border);
          padding: 0;
        }

        .settings-group:last-child {
          border-bottom: none;
        }

        .settings-label {
          color: var(--text-secondary);
          font-size: 12px;
          padding: 10px 15px;
          display: block;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: bold;
        }

        .settings-option {
          background: transparent;
          border: none;
          color: var(--text-primary);
          padding: 10px 15px;
          width: 100%;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 13px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .settings-option:hover {
          background: var(--tertiary);
          color: var(--accent);
        }

        .settings-option.active {
          color: var(--accent);
          font-weight: bold;
        }
      `}</style>

      <div className="player-header">
        <div className="player-title">
          {cartoon?.title} - {episode?.name}
        </div>
        <button className="close-btn" onClick={onClose}>✕ Close</button>
      </div>

      <div className="player-container" onMouseMove={handleMouseMove}>
        <video
          ref={videoRef}
          className="video-element"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          src={episode?.videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4'}
        />

        {showControls && (
          <div className="player-controls">
            <input
              type="range"
              min="0"
              max="100"
              value={duration ? (currentTime / duration) * 100 : 0}
              onChange={handleProgressChange}
              className="progress-bar"
            />

            <div className="controls-bottom">
              <div className="controls-left">
                <button className="control-btn" onClick={togglePlay}>
                  {isPlaying ? '⏸' : '▶'}
                </button>

                <div className="volume-control">
                  <span className="control-btn">🔊</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="volume-slider"
                  />
                </div>

                <div className="time-display">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className="controls-left">
                <select
                  value={selectedAudio}
                  onChange={(e) => setSelectedAudio(e.target.value)}
                  className="control-btn"
                  style={{ background: 'var(--secondary)', border: '1px solid var(--border)', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  <option value="english">English</option>
                  <option value="tamil">Tamil</option>
                  <option value="hindi">Hindi</option>
                </select>

                <select
                  value={playbackSpeed}
                  onChange={(e) => {
                    const speed = parseFloat(e.target.value);
                    setPlaybackSpeed(speed);
                    if (videoRef.current) videoRef.current.playbackRate = speed;
                  }}
                  className="control-btn"
                  style={{ background: 'var(--secondary)', border: '1px solid var(--border)', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  <option value="0.5">0.5x</option>
                  <option value="0.75">0.75x</option>
                  <option value="1">1x</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2x</option>
                </select>

                <button className="control-btn" onClick={toggleFullscreen}>
                  {isFullscreen ? '⛶' : '⛶'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// DETAIL PAGE COMPONENT
// ============================================================================
const DetailPage = ({ cartoon, onBack, onEpisodeSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState(
    cartoon.categories && Object.keys(cartoon.categories)[0]
  );

  const episodes = selectedCategory
    ? cartoon.categories[selectedCategory]?.episodes || []
    : [];

  return (
    <div className="detail-page">
      <style>{`
        .detail-page {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          animation: fadeInUp 0.6s ease-out;
        }

        .detail-header {
          position: relative;
          height: 400px;
          background: linear-gradient(180deg, rgba(0, 255, 65, 0.1) 0%, var(--primary) 100%);
          border-bottom: 3px solid var(--accent);
          padding: 40px 60px;
          display: flex;
          align-items: flex-end;
          gap: 40px;
        }

        .detail-image {
          width: 200px;
          height: 300px;
          border-radius: 8px;
          object-fit: cover;
          border: 3px solid var(--accent);
          box-shadow: 0 20px 60px rgba(0, 255, 65, 0.2);
        }

        .detail-info {
          flex: 1;
        }

        .detail-title {
          font-size: 48px;
          font-weight: 900;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 15px;
          line-height: 1.2;
        }

        .detail-meta {
          display: flex;
          gap: 25px;
          margin-bottom: 20px;
          font-size: 15px;
          color: var(--text-secondary);
        }

        .detail-description {
          max-width: 500px;
          color: var(--text-secondary);
          line-height: 1.6;
          font-size: 15px;
        }

        .back-btn {
          position: absolute;
          top: 30px;
          left: 60px;
          background: var(--accent);
          border: none;
          color: var(--primary);
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .back-btn:hover {
          background: var(--accent-dark);
          transform: translateX(-3px);
        }

        .episodes-section {
          padding: 60px;
        }

        .category-tabs {
          display: flex;
          gap: 15px;
          margin-bottom: 40px;
          border-bottom: 2px solid var(--border);
          flex-wrap: wrap;
        }

        .category-tab {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 15px 25px;
          cursor: pointer;
          font-size: 15px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          position: relative;
          transition: all 0.3s;
          border-bottom: 3px solid transparent;
          margin-bottom: -2px;
        }

        .category-tab:hover {
          color: var(--accent);
        }

        .category-tab.active {
          color: var(--accent);
          border-bottom-color: var(--accent);
        }

        .episodes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 25px;
        }

        .episode-card {
          background: var(--secondary);
          border: 2px solid var(--border);
          border-radius: 8px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }

        .episode-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, var(--accent), transparent);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s;
        }

        .episode-card:hover {
          border-color: var(--accent);
          transform: translateY(-8px);
          box-shadow: 0 15px 40px rgba(0, 255, 65, 0.2);
        }

        .episode-card:hover::before {
          transform: scaleX(1);
        }

        .episode-number {
          color: var(--accent);
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 10px;
        }

        .episode-name {
          color: var(--text-primary);
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .episode-duration {
          color: var(--text-secondary);
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .play-icon {
          position: absolute;
          right: 20px;
          top: 20px;
          width: 40px;
          height: 40px;
          background: var(--accent);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: all 0.3s;
          transform: scale(0.8);
        }

        .episode-card:hover .play-icon {
          opacity: 1;
          transform: scale(1);
        }

        .play-icon svg {
          color: var(--primary);
        }
      `}</style>

      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <img
          src={cartoon.image || 'https://via.placeholder.com/200x300?text=Cartoon'}
          alt={cartoon.title}
          className="detail-image"
        />
        <div className="detail-info">
          <h1 className="detail-title">{cartoon.title}</h1>
          <div className="detail-meta">
            <span>📺 {cartoon.episodes || 0} Total Episodes</span>
            <span>⭐ {cartoon.rating || 8.5}/10</span>
            <span>🎬 {cartoon.year || 2020}</span>
          </div>
          <p className="detail-description">
            {cartoon.description || 'An amazing cartoon series. Watch all episodes and enjoy!'}
          </p>
        </div>
      </div>

      <div className="episodes-section">
        <div className="category-tabs">
          {cartoon.categories &&
            Object.keys(cartoon.categories).map((cat) => (
              <button
                key={cat}
                className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
        </div>

        <div className="episodes-grid">
          {episodes.map((episode, idx) => (
            <div
              key={idx}
              className="episode-card"
              onClick={() => onEpisodeSelect(episode, cartoon)}
            >
              <div className="episode-number">Episode {idx + 1}</div>
              <div className="episode-name">{episode.name}</div>
              <div className="episode-duration">
                <Clock size={14} />
                {episode.duration || '24'} min
              </div>
              <div className="play-icon">
                <Play size={20} fill="currentColor" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ADMIN PANEL COMPONENT
// ============================================================================
const AdminPanel = ({ onClose }) => {
  const [cartoonTitle, setCartoonTitle] = useState('');
  const [cartoonImage, setCartoonImage] = useState('');
  const [episodeName, setEpisodeName] = useState('');
  const [episodeFile, setEpisodeFile] = useState(null);

  const handleAddCartoon = () => {
    if (cartoonTitle.trim()) {
      alert(`Cartoon "${cartoonTitle}" would be added to database`);
      setCartoonTitle('');
      setCartoonImage('');
    }
  };

  return (
    <div className="admin-modal">
      <style>{`
        .admin-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.95);
          z-index: 2000;
          display: flex;
          flex-direction: column;
          animation: fadeInUp 0.4s ease-out;
        }

        .admin-header {
          padding: 30px 40px;
          border-bottom: 2px solid var(--accent);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--primary);
        }

        .admin-title {
          font-size: 24px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--accent);
        }

        .admin-content {
          flex: 1;
          overflow-y: auto;
          padding: 40px;
        }

        .admin-section {
          background: var(--secondary);
          border: 2px solid var(--border);
          border-radius: 8px;
          padding: 30px;
          margin-bottom: 30px;
          animation: fadeInUp 0.5s ease-out;
        }

        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid var(--border);
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          color: var(--text-primary);
          font-size: 13px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }

        .form-input,
        .form-textarea {
          width: 100%;
          padding: 12px 16px;
          background: var(--tertiary);
          border: 2px solid var(--border);
          border-radius: 4px;
          color: var(--text-primary);
          font-size: 14px;
          transition: all 0.3s;
          font-family: inherit;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 20px rgba(0, 255, 65, 0.2);
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .btn-group {
          display: flex;
          gap: 15px;
          margin-top: 25px;
        }

        .btn {
          flex: 1;
          padding: 14px 24px;
          border: none;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 13px;
        }

        .btn-primary {
          background: var(--accent);
          color: var(--primary);
        }

        .btn-primary:hover {
          background: var(--accent-dark);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 255, 65, 0.3);
        }

        .btn-secondary {
          background: transparent;
          border: 2px solid var(--accent);
          color: var(--accent);
        }

        .btn-secondary:hover {
          background: var(--accent);
          color: var(--primary);
          transform: translateY(-2px);
        }

        .success-message {
          background: rgba(0, 255, 65, 0.1);
          border: 2px solid var(--accent);
          color: var(--accent);
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
          text-align: center;
          font-weight: bold;
        }
      `}</style>

      <div className="admin-header">
        <div className="admin-title">⚙️ Admin Panel</div>
        <button className="btn btn-secondary" onClick={onClose} style={{ width: 'auto' }}>
          Close ✕
        </button>
      </div>

      <div className="admin-content">
        <div className="admin-section">
          <div className="section-title">➕ Add New Cartoon</div>

          <div className="form-group">
            <label className="form-label">Cartoon Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Ben 10"
              value={cartoonTitle}
              onChange={(e) => setCartoonTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Image URL</label>
            <input
              type="text"
              className="form-input"
              placeholder="https://example.com/image.jpg"
              value={cartoonImage}
              onChange={(e) => setCartoonImage(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              placeholder="Describe the cartoon series..."
            />
          </div>

          <div className="btn-group">
            <button className="btn btn-primary" onClick={handleAddCartoon}>
              Add Cartoon
            </button>
            <button className="btn btn-secondary">Cancel</button>
          </div>
        </div>

        <div className="admin-section">
          <div className="section-title">📹 Upload Episode</div>

          <div className="form-group">
            <label className="form-label">Episode Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., The Omnitrix"
              value={episodeName}
              onChange={(e) => setEpisodeName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Video File</label>
            <input
              type="file"
              className="form-input"
              accept="video/*"
              onChange={(e) => setEpisodeFile(e.target.files?.[0])}
            />
          </div>

          <div className="btn-group">
            <button className="btn btn-primary">Upload Episode</button>
            <button className="btn btn-secondary">Cancel</button>
          </div>
        </div>

        <div className="admin-section">
          <div className="section-title">📊 Content Statistics</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div style={{ textAlign: 'center', padding: '20px', background: 'var(--tertiary)', borderRadius: '8px' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--accent)' }}>5</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Cartoons</div>
            </div>
            <div style={{ textAlign: 'center', padding: '20px', background: 'var(--tertiary)', borderRadius: '8px' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--accent)' }}>124</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Episodes</div>
            </div>
            <div style={{ textAlign: 'center', padding: '20px', background: 'var(--tertiary)', borderRadius: '8px' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--accent)' }}>2.3 GB</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Storage Used</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
export default function CartoonStreamingApp() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedCartoon, setSelectedCartoon] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);

  // Mock data
  const mockCartoons = [
    {
      id: 1,
      title: 'Ben 10',
      image: 'classic-ben10.jpg',
      description: 'Ben discovers a mysterious device and becomes the hero Ben 10!',
      episodes: 76,
      rating: 8.8,
      year: 2005,
      categories: {
        'Ben 10': {
          episodes: [
            { name: 'And Then There Were None', duration: '23' },
            { name: 'The Omnitrix', duration: '23' },
            { name: 'The Krakken', duration: '23' },
          ],
        },
        'Omnitrix': {
          episodes: [
            { name: 'The Omnitrix Strikes Back', duration: '23' },
            { name: 'Omnitrix Under Siege', duration: '23' },
          ],
        },
        'Omniverse': {
          episodes: [
            { name: 'Omniverse Begins', duration: '23' },
            { name: 'The Omnipotent', duration: '23' },
          ],
        },
      },
    },
    {
      id: 2,
      title: 'Adventure Time',
      image: 'https://wallpapers.com/images/hd/classic-ben-10-poster-c6luvo5pt5pd9no4.jpg',
      description: 'Follow Finn and Jake on epic adventures in the Land of Ooo!',
      episodes: 283,
      rating: 8.6,
      year: 2010,
      categories: {
        'Season 1': {
          episodes: [
            { name: 'Finn', duration: '11' },
            { name: 'The Watcher', duration: '11' },
          ],
        },
      },
    },
    {
      id: 3,
      title: 'The Amazing Spider-Man',
      image: 'https://via.placeholder.com/400x225?text=Spider-Man',
      description: 'Experience the web-slinging adventures of your friendly neighborhood Spider-Man!',
      episodes: 65,
      rating: 8.4,
      year: 2012,
      categories: {
        'Season 1': {
          episodes: [
            { name: 'Ultimate Spider-Man', duration: '24' },
            { name: 'Great Power', duration: '24' },
          ],
        },
      },
    },
    {
      id: 4,
      title: 'Dragon Ball Z',
      image: 'https://via.placeholder.com/400x225?text=Dragon+Ball+Z',
      description: 'The legendary battles of Goku and his friends against powerful foes!',
      episodes: 291,
      rating: 9.0,
      year: 1989,
      categories: {
        'Saiyan Saga': {
          episodes: [
            { name: 'The Arrival', duration: '24' },
            { name: 'The New Threat', duration: '24' },
          ],
        },
      },
    },
    {
      id: 5,
      title: 'Naruto',
      image: 'https://via.placeholder.com/400x225?text=Naruto',
      description: 'Follow Naruto as he becomes the greatest ninja in the Hidden Leaf Village!',
      episodes: 220,
      rating: 8.9,
      year: 2002,
      categories: {
        'Part 1': {
          episodes: [
            { name: 'Enter Naruto Uzumaki!', duration: '23' },
            { name: 'My Name is Sasuke Uchiha', duration: '23' },
          ],
        },
      },
    },
  ];

  return (
    <>
      <style>{styles}</style>

      <Header onAdminClick={() => setShowAdmin(true)} />

      {currentPage === 'home' && (
        <>
          <Carousel cartoons={mockCartoons} />

          <CategorySection
            title="Featured Cartoons"
            cartoons={mockCartoons.slice(0, 5)}
            onCartoonSelect={(cartoon) => {
              setSelectedCartoon(cartoon);
              setCurrentPage('detail');
            }}
          />

          <CategorySection
            title="Trending Now"
            cartoons={mockCartoons.slice(2, 5)}
            onCartoonSelect={(cartoon) => {
              setSelectedCartoon(cartoon);
              setCurrentPage('detail');
            }}
          />

          <CategorySection
            title="Recently Added"
            cartoons={mockCartoons}
            onCartoonSelect={(cartoon) => {
              setSelectedCartoon(cartoon);
              setCurrentPage('detail');
            }}
          />
        </>
      )}

      {currentPage === 'detail' && selectedCartoon && (
        <DetailPage
          cartoon={selectedCartoon}
          onBack={() => setCurrentPage('home')}
          onEpisodeSelect={(episode, cartoon) => {
            setSelectedEpisode(episode);
            setSelectedCartoon(cartoon);
          }}
        />
      )}

      {selectedEpisode && (
        <VideoPlayer
          episode={selectedEpisode}
          cartoon={selectedCartoon}
          onClose={() => setSelectedEpisode(null)}
        />
      )}

      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </>
  );
}
