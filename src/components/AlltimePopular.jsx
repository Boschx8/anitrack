import React from 'react';
import AnimeCard from './AnimeCard';

const AlltimePopularAnime = ({ animeList = [] }) => {
  if (animeList.length === 0) {
    return (
      <section className="popular-section">
        <div className="section-header">
          <h3>All Time Popular</h3>
        </div>
        <div>No popular anime available at the moment.</div>
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