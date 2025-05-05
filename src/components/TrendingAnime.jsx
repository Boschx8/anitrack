import React, { useState, useEffect } from 'react';
import AnimeCard from './AnimeCard';
import { getTrendingAnime } from '../utils/api';

const TrendingAnime = () => {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTrendingAnime();
        setAnimeList(data);
      } catch (err) {
        setError('Failed to fetch trending anime');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <section className="anime-section">
        <div className="section-header">
          <h3>Trending Now</h3>
        </div>
        <div className="loading">Loading...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="anime-section">
        <div className="section-header">
          <h3>Trending Now</h3>
        </div>
        <div className="error">{error}</div>
      </section>
    );
  }

  return (
    <section className="anime-section">
      <div className="section-header">
        <h3>Trending Now</h3>
      </div>
      <div className="anime-grid">
        {animeList.map((anime) => (
          <AnimeCard
            key={anime.mal_id}
            anime={{
              title: anime.title,
              genre: anime.genres?.map(g => g.name).join(', '),
              image: anime.images.jpg.large_image_url,
              mal_id: anime.mal_id,
              id: anime.mal_id  
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default TrendingAnime;