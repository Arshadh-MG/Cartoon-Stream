import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Captions,
  Gauge,
  Languages,
  Maximize,
  Minimize,
  Monitor,
  Pause,
  PictureInPicture2,
  Play,
  RotateCcw,
  RotateCw,
  Settings,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { formatClockTime } from '../lib/catalog.js';

const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
const qualities = ['Auto', '1080p', '720p', '480p'];

export default function AdvancedVideoPlayer({
  episode,
  cartoon,
  nextEpisode,
  previousEpisode,
  onNext,
  onPrevious,
}) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const controlsTimer = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [quality, setQuality] = useState('Auto');
  const [selectedAudio, setSelectedAudio] = useState('');
  const [captionsOn, setCaptionsOn] = useState(false);
  const [ambientOn, setAmbientOn] = useState(true);
  const [autoplayNext, setAutoplayNext] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoError, setVideoError] = useState('');

  const audioLanguages = useMemo(() => {
    return episode?.audio_languages?.length ? episode.audio_languages : ['English', 'Tamil', 'Hindi'];
  }, [episode]);

  useEffect(() => {
    setSelectedAudio(audioLanguages[0] ?? 'English');
  }, [audioLanguages]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = isMuted;
    video.playbackRate = speed;
  }, [volume, isMuted, speed, episode?.id]);

  useEffect(() => {
    setIsPlaying(false);
    setDuration(0);
    setCurrentTime(0);
    setSettingsOpen(false);
    setShowControls(true);
  }, [episode?.id]);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      const tagName = event.target?.tagName?.toLowerCase();
      if (['input', 'select', 'textarea'].includes(tagName)) return;

      if (event.code === 'Space') {
        event.preventDefault();
        togglePlay();
      }
      if (event.key === 'ArrowLeft') skip(-10);
      if (event.key === 'ArrowRight') skip(10);
      if (event.key.toLowerCase() === 'm') setIsMuted((current) => !current);
      if (event.key.toLowerCase() === 'f') toggleFullscreen();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  useEffect(() => {
    return () => {
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
    };
  }, []);

  async function togglePlay(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();

    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      try {
        video.playbackRate = speed;
        await video.play();
        setVideoError('');
        setIsPlaying(true);
      } catch (error) {
        const message = error?.message || 'Unable to play this video.';
        setVideoError(message);
        console.warn('Playback was blocked:', message);
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }

  function handleVideoError() {
    const video = videoRef.current;
    if (!video?.error) return;
    const error = video.error;
    const message = error.message || `Video failed to load (code: ${error.code}).`;
    setVideoError(message);
  }

  function skip(seconds) {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(Math.max(video.currentTime + seconds, 0), duration || video.duration || 0);
    setCurrentTime(video.currentTime);
  }

  function handleSeek(event) {
    const video = videoRef.current;
    if (!video) return;
    const nextTime = Number(event.target.value);
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  }

  function handlePointerMove() {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => {
      if (!videoRef.current?.paused) setShowControls(false);
    }, 2600);
  }

  async function toggleFullscreen() {
    if (!playerRef.current) return;

    if (!document.fullscreenElement) {
      await playerRef.current.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  }

  async function togglePictureInPicture() {
    const video = videoRef.current;
    if (!video || !document.pictureInPictureEnabled) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (error) {
      console.warn('Picture in picture is unavailable:', error.message);
    }
  }

  function handleEnded() {
    setIsPlaying(false);
    if (autoplayNext && nextEpisode && onNext) {
      onNext();
    }
  }

  const videoSrc = String(episode?.video_url || episode?.video_path || '').trim();
  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const missingVideoSrc = !videoSrc;

  return (
    <div
      ref={playerRef}
      className={`advanced-player ${ambientOn ? 'ambient-on' : ''} ${showControls ? 'controls-visible' : ''}`}
      onMouseMove={handlePointerMove}
      onFocus={handlePointerMove}
    >
      {ambientOn && <img className="ambient-frame" src={episode?.thumbnail_url || cartoon?.hero_image_url || cartoon?.image_url} alt="" />}

      <video
        ref={videoRef}
        className="advanced-video"
        src={videoSrc || undefined}
        poster={episode?.thumbnail_url || cartoon?.hero_image_url || cartoon?.image_url}
        playsInline
        preload="metadata"
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            videoRef.current.playbackRate = speed;
          }
          setDuration(videoRef.current?.duration || episode?.duration || 0);
        }}
        onEnded={handleEnded}
        onError={handleVideoError}
      >
        {videoSrc && <source src={videoSrc} />}
      </video>

      {(videoError || missingVideoSrc) && (
        <div className="video-error-overlay">
          <p>{videoError || 'No video source found for this episode.'}</p>
          <small>Check that the file is browser-compatible and that the Supabase storage URL is public.</small>
        </div>
      )}

      {!isPlaying && (
        <button className="player-center-action" type="button" onClick={togglePlay} aria-label="Play episode" title="Play episode">
          <Play size={36} fill="currentColor" />
        </button>
      )}

      {captionsOn && (
        <div className="caption-line">
          {episode?.description || `${cartoon?.title ?? 'Episode'} is ready to stream.`}
        </div>
      )}

      <div className="player-topbar">
        <div>
          <p className="eyebrow">{cartoon?.title}</p>
          <h1>{episode?.name}</h1>
        </div>
        <div className="player-pill">{quality} stream</div>
      </div>

      <div className="player-control-surface">
        <input
          className="player-progress"
          type="range"
          min="0"
          max={duration || episode?.duration || 0}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          style={{ '--progress': `${progressPercent}%` }}
          aria-label="Episode progress"
        />

        <div className="player-controls-row">
          <div className="player-controls-group">
            <button type="button" className="icon-button" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'} title={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
            </button>
            <button type="button" className="icon-button" onClick={() => skip(-10)} aria-label="Back 10 seconds" title="Back 10 seconds">
              <RotateCcw size={20} />
            </button>
            <button type="button" className="icon-button" onClick={() => skip(10)} aria-label="Forward 10 seconds" title="Forward 10 seconds">
              <RotateCw size={20} />
            </button>
            <button
              type="button"
              className="icon-button"
              onClick={onPrevious}
              disabled={!previousEpisode}
              aria-label="Previous episode"
              title="Previous episode"
            >
              <SkipBack size={20} />
            </button>
            <button type="button" className="icon-button" onClick={onNext} disabled={!nextEpisode} aria-label="Next episode" title="Next episode">
              <SkipForward size={20} />
            </button>
          </div>

          <div className="player-time">
            {formatClockTime(currentTime)} / {formatClockTime(duration || episode?.duration)}
          </div>

          <div className="player-controls-group player-controls-right">
            <button type="button" className="icon-button" onClick={() => setIsMuted((current) => !current)} aria-label="Mute" title="Mute">
              {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              className="volume-range"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(event) => {
                setVolume(Number(event.target.value));
                setIsMuted(Number(event.target.value) === 0);
              }}
              aria-label="Volume"
            />
            <button
              type="button"
              className={`icon-button ${captionsOn ? 'active' : ''}`}
              onClick={() => setCaptionsOn((current) => !current)}
              aria-label="Captions"
              title="Captions"
            >
              <Captions size={20} />
            </button>
            <button type="button" className="icon-button" onClick={togglePictureInPicture} aria-label="Picture in picture" title="Picture in picture">
              <PictureInPicture2 size={20} />
            </button>
            <button
              type="button"
              className={`icon-button ${settingsOpen ? 'active' : ''}`}
              onClick={() => setSettingsOpen((current) => !current)}
              aria-label="Playback settings"
              title="Playback settings"
            >
              <Settings size={20} />
            </button>
            <button type="button" className="icon-button" onClick={toggleFullscreen} aria-label="Fullscreen" title="Fullscreen">
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>
      </div>

      {settingsOpen && (
        <div className="settings-popover">
          <div className="settings-section">
            <div className="settings-heading">
              <Gauge size={16} /> Speed
            </div>
            <div className="segmented-options">
              {speeds.map((item) => (
                <button key={item} type="button" className={speed === item ? 'active' : ''} onClick={() => setSpeed(item)}>
                  {item}x
                </button>
              ))}
            </div>
          </div>

          <div className="settings-section">
            <div className="settings-heading">
              <Monitor size={16} /> Quality
            </div>
            <div className="segmented-options">
              {qualities.map((item) => (
                <button key={item} type="button" className={quality === item ? 'active' : ''} onClick={() => setQuality(item)}>
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="settings-section">
            <div className="settings-heading">
              <Languages size={16} /> Audio
            </div>
            <div className="segmented-options">
              {audioLanguages.map((item) => (
                <button key={item} type="button" className={selectedAudio === item ? 'active' : ''} onClick={() => setSelectedAudio(item)}>
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="settings-switches">
            <label>
              <input type="checkbox" checked={ambientOn} onChange={(event) => setAmbientOn(event.target.checked)} />
              Ambient lights
            </label>
            <label>
              <input type="checkbox" checked={autoplayNext} onChange={(event) => setAutoplayNext(event.target.checked)} />
              Autoplay next
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
