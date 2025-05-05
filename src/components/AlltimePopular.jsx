// src/components/AlltimePopular.jsx
import React, { useState, useEffect } from 'react';
import AnimeCard from './AnimeCard';

const AlltimePopularAnime = () => {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('https://api.jikan.moe/v4/top/anime?filter=bypopularity&limit=12', {
          signal: controller.signal
        });

        if (!response.ok) {
          if (response.status === 429) {
            setLoading(false);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (isMounted && data.data) {
          setAnimeList(data.data);
          setError(null);
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        
        if (isMounted) {
          setError('Failed to fetch popular anime');
          setAnimeList(prev => prev.length > 0 ? prev : []);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  if (loading && animeList.length === 0) {
    return (
      <section className="popular-section">
        <div className="section-header">
          <h3>All Time Popular</h3>
        </div>
        <div className="loading">Loading...</div>
      </section>
    );
  }

  if (error && animeList.length === 0) {
    return (
      <section className="popular-section">
        <div className="section-header">
          <h3>All Time Popular</h3>
        </div>
        <div className="error">{error}</div>
      </section>
    );
  }

  return (
    <section className="popular-section">
      <div className="section-header">
        <h3>All Time Popular</h3>
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

export default AlltimePopularAnime;