import React, { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import AnimeCard from '../components/AnimeCard';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [trendingAnimes, setTrendingAnimes] = useState([]);
  const [upcomingAnimes, setUpcomingAnimes] = useState([]);
  const [popularAnimes, setPopularAnimes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnimeData = async () => {
      try {
        setLoading(true);
        
        // Primer fem la petició d'animes en tendència per evitar errors de rate limiting
        const trendingResponse = await fetch('https://api.jikan.moe/v4/top/anime?filter=airing&limit=6');
        const trendingData = await trendingResponse.json();
        setTrendingAnimes(trendingData.data || []);
        
        // Esperem 1 segon per evitar errors de rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Després fem la petició d'animes propers
        const upcomingResponse = await fetch('https://api.jikan.moe/v4/seasons/upcoming?limit=6');
        const upcomingData = await upcomingResponse.json();
        setUpcomingAnimes(upcomingData.data || []);
        
        // Esperem un altre segon
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
          // Fem la petició per obtenir els animes populars
          const popularResponse = await fetch('https://api.jikan.moe/v4/top/anime?filter=bypopularity&limit=18');
          
          if (!popularResponse.ok) {
            throw new Error(`Error: ${popularResponse.status}`);
          }
          
          const popularData = await popularResponse.json();
          setPopularAnimes(popularData.data || []);
          
          // Si hi ha un problema específicament amb popular, no trenquem tota la càrrega
        } catch (popularError) {
          console.error('Error carregant animes populars:', popularError);
          // No establim error global perquè la resta de la pàgina segueixi funcionant
        }
        
      } catch (error) {
        console.error('Error carregant dades d\'anime:', error);
        setError('Failed to load anime data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnimeData();
  }, []);

  // Component intern per renderitzar la secció d'animes en tendència
  const TrendingAnimeSection = ({ animeList }) => {
    if (animeList.length === 0) {
      return (
        <section className="anime-section">
          <div className="section-header">
            <h3>Trending Now</h3>
          </div>
          <div>No trending anime available at the moment.</div>
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
                image: anime.images?.jpg?.large_image_url,
                mal_id: anime.mal_id
              }}
            />
          ))}
        </div>
      </section>
    );
  };

  // Component intern per renderitzar la secció d'animes propers
  const UpcomingAnimeSection = ({ animeList }) => {
    if (animeList.length === 0) {
      return (
        <section className="recommended-section">
          <div className="section-header">
            <h3>Upcoming Next Season</h3>
          </div>
          <div>No upcoming anime available at the moment.</div>
        </section>
      );
    }

    return (
      <section className="recommended-section">
        <div className="section-header">
          <h3>Upcoming Next Season</h3>
        </div>
        <div className="anime-grid">
          {animeList.map((anime) => (
            <AnimeCard
              key={anime.mal_id}
              anime={{
                title: anime.title,
                genre: anime.genres?.map(g => g.name).join(', '),
                image: anime.images?.jpg?.large_image_url,
                mal_id: anime.mal_id
              }}
            />
          ))}
        </div>
      </section>
    );
  };

  // Component intern per renderitzar la secció d'animes populars
  const PopularAnimeSection = ({ animeList }) => {
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
                image: anime.images?.jpg?.large_image_url,
                mal_id: anime.mal_id
              }}
            />
          ))}
        </div>
      </section>
    );
  };

  if (loading) {
    return (
      <div className="loading-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 'calc(100vh - 200px)',
        backgroundColor: '#121212'
      }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container" style={{ 
        textAlign: 'center',
        padding: '3rem',
        backgroundColor: '#121212',
        color: 'white',
        minHeight: 'calc(100vh - 200px)'
      }}>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="retry-button"
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <main>
      <HeroSection />
      <TrendingAnimeSection animeList={trendingAnimes} />
      <UpcomingAnimeSection animeList={upcomingAnimes} />
      <PopularAnimeSection animeList={popularAnimes} />
    </main>
  );
};

export default HomePage;