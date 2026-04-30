import { sampleCartoons } from '../data/sampleData.js';
import { isSupabaseConfigured, supabase } from '../supabaseClient.js';

const catalogSelect =
  'id,title,description,image_url,rating,year,categories(id,name,order,episodes(id,cartoon_id,category_id,episode_number,name,description,duration,video_url,thumbnail_url,views))';

export function normalizeEpisode(episode, cartoon, category) {
  return {
    ...episode,
    id: episode.id,
    cartoon_id: episode.cartoon_id ?? cartoon.id,
    category_id: episode.category_id ?? category.id,
    episode_number: episode.episode_number ?? 1,
    name: episode.name ?? 'Untitled episode',
    description: episode.description ?? '',
    duration: Number(episode.duration ?? 0),
    views: Number(episode.views ?? 0),
    video_url: episode.video_url || episode.video_path || '',
    thumbnail_url: episode.thumbnail_url || cartoon.image_url,
    audio_languages: episode.audio_languages?.length ? episode.audio_languages : ['English', 'Tamil', 'Hindi'],
  };
}

export function normalizeCartoon(cartoon) {
  const base = {
    ...cartoon,
    title: cartoon.title ?? 'Untitled cartoon',
    description: cartoon.description ?? '',
    image_url: cartoon.image_url || cartoon.poster_url || cartoon.hero_image_url,
    hero_image_url: cartoon.hero_image_url || cartoon.image_url || cartoon.poster_url,
    poster_url: cartoon.poster_url || cartoon.image_url || cartoon.hero_image_url,
    rating: Number(cartoon.rating ?? 8.5),
    year: cartoon.year ?? new Date().getFullYear(),
    maturity: cartoon.maturity ?? '7+',
    genres: cartoon.genres?.length ? cartoon.genres : ['Animation', 'Adventure'],
  };

  const categories = (cartoon.categories ?? [])
    .map((category, index) => {
      const normalizedCategory = {
        ...category,
        id: category.id ?? `${cartoon.id}-${index}`,
        name: category.name ?? `Season ${index + 1}`,
        order: Number(category.order ?? index),
        description: category.description ?? '',
      };

      return {
        ...normalizedCategory,
        episodes: (category.episodes ?? [])
          .map((episode) => normalizeEpisode(episode, base, normalizedCategory))
          .sort((left, right) => Number(left.episode_number) - Number(right.episode_number)),
      };
    })
    .sort((left, right) => Number(left.order) - Number(right.order));

  return {
    ...base,
    categories,
    episode_count: categories.reduce((sum, category) => sum + category.episodes.length, 0),
    total_views: categories.reduce(
      (sum, category) => sum + category.episodes.reduce((episodeSum, episode) => episodeSum + Number(episode.views ?? 0), 0),
      0,
    ),
  };
}

export function normalizeCatalog(cartoons = []) {
  return cartoons
    .map(normalizeCartoon)
    .filter((cartoon) => cartoon.episode_count > 0);
}

export async function fetchCatalog() {
  if (!isSupabaseConfigured) {
    return normalizeCatalog(sampleCartoons);
  }

  const { data, error } = await supabase.from('cartoons').select(catalogSelect);

  if (error) {
    console.warn('Catalog fetch failed. Using sample catalog instead:', error.message);
    return normalizeCatalog(sampleCartoons);
  }

  if (!data?.length) {
    return normalizeCatalog(sampleCartoons);
  }

  return normalizeCatalog(data);
}

export function flattenEpisodes(cartoons) {
  return cartoons.flatMap((cartoon) =>
    cartoon.categories.flatMap((category) =>
      category.episodes.map((episode, episodeIndex) => ({
        ...episode,
        cartoon,
        category,
        episodeIndex,
      })),
    ),
  );
}

export function findCartoon(cartoons, cartoonId) {
  return cartoons.find((cartoon) => String(cartoon.id) === String(cartoonId));
}

export function getFirstEpisode(cartoon) {
  return cartoon?.categories?.find((category) => category.episodes.length > 0)?.episodes?.[0] ?? null;
}

export function findEpisodeContext(cartoons, episodeId) {
  const playlist = flattenEpisodes(cartoons);
  const index = playlist.findIndex((item) => String(item.id) === String(episodeId));

  if (index < 0) {
    return null;
  }

  return {
    ...playlist[index],
    previousEpisode: playlist[index - 1] ?? null,
    nextEpisode: playlist[index + 1] ?? null,
    playlist,
  };
}

export function formatDuration(totalSeconds = 0) {
  const seconds = Number(totalSeconds);
  if (!seconds || Number.isNaN(seconds)) return '0m';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function formatClockTime(totalSeconds = 0) {
  const seconds = Number(totalSeconds);
  if (!seconds || Number.isNaN(seconds)) return '0:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

export function getCatalogStats(cartoons) {
  const episodes = flattenEpisodes(cartoons);
  return {
    cartoons: cartoons.length,
    episodes: episodes.length,
    views: episodes.reduce((sum, episode) => sum + Number(episode.views ?? 0), 0),
  };
}
