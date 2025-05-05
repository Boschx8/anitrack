// src/utils/api.js

const BASE_URL = 'https://api.jikan.moe/v4';

// Helper function to handle API requests with error handling and rate limiting
const fetchWithRetry = async (url, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      
      if (response.status === 429) {
        // Rate limit exceeded, wait and retry
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export const getTrendingAnime = async () => {
  const data = await fetchWithRetry(`${BASE_URL}/top/anime?filter=airing&limit=6`);
  return data.data;
};

export const getUpcomingAnime = async () => {
  const data = await fetchWithRetry(`${BASE_URL}/seasons/upcoming?limit=6`);
  return data.data;
};

export const getAllTimePopularAnime = async () => {
  const data = await fetchWithRetry(`${BASE_URL}/top/anime?filter=bypopularity&limit=6`);
  return data.data;
};