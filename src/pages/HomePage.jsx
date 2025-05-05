import React, { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import RecommendedAnime from '../components/RecommendedAnime';
import TrendingAnime from '../components/TrendingAnime';
import CollectionsSection from '../components/CollectionsSection';
import AlltimePopularAnime from '../components/AlltimePopular';
import LoadingSpinner from '../components/LoadingSpinner';
import { getTrendingAnime, getUpcomingAnime, getAllTimePopularAnime } from '../utils/api';

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [trendingAnimes, setTrendingAnimes] = useState([]);
  const [upcomingAnimes, setUpcomingAnimes] = useState([]);
  const [popularAnimes, setPopularAnimes] = useState([]);
  const [error, setError] = useState(null);

  // Número de tarjetas deseado por sección
  const CARDS_PER_SECTION = 6;

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Fetch más animes de los necesarios para tener suficientes para reemplazar duplicados
        // Pedimos 12 en lugar de 6 para tener extras
        const trendingPromise = fetch(`https://api.jikan.moe/v4/top/anime?filter=airing&limit=12`);
        const upcomingPromise = fetch(`https://api.jikan.moe/v4/seasons/upcoming?limit=12`);
        const popularPromise = fetch(`https://api.jikan.moe/v4/top/anime?filter=bypopularity&limit=12`);
        
        // Esperamos todas las respuestas
        const responses = await Promise.all([trendingPromise, upcomingPromise, popularPromise]);
        
        // Procesamos cada respuesta
        const trendingData = await responses[0].json();
        const upcomingData = await responses[1].json();
        const popularData = await responses[2].json();
        
        // Obtenemos los arrays de animes de las respuestas
        const trending = trendingData.data || [];
        const upcoming = upcomingData.data || [];
        const popular = popularData.data || [];
        
        // Procesamos cada sección para eliminar duplicados
        const uniqueTrending = removeDuplicatesInSection(trending);
        
        // Si después de eliminar duplicados tenemos menos de 6, rellenamos con más tarjetas
        const finalTrending = ensureMinimumCards(uniqueTrending, CARDS_PER_SECTION);
        const finalUpcoming = ensureMinimumCards(removeDuplicatesInSection(upcoming), CARDS_PER_SECTION);
        const finalPopular = ensureMinimumCards(removeDuplicatesInSection(popular), CARDS_PER_SECTION);
        
        // Actualizamos el estado
        setTrendingAnimes(finalTrending);
        setUpcomingAnimes(finalUpcoming);
        setPopularAnimes(finalPopular);
        
      } catch (error) {
        console.error('Error fetching anime data:', error);
        setError('Failed to load anime data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Helper function to remove duplicates within a section
  const removeDuplicatesInSection = (animes) => {
    const uniqueIds = new Set();
    return animes.filter(anime => {
      if (uniqueIds.has(anime.mal_id)) {
        return false;
      }
      uniqueIds.add(anime.mal_id);
      return true;
    });
  };

  // Helper function to asegurar que tenemos al menos el número mínimo de tarjetas
  const ensureMinimumCards = (animeList, minCount) => {
    // Si ya tenemos suficientes tarjetas, devolvemos las primeras 'minCount'
    if (animeList.length >= minCount) {
      return animeList.slice(0, minCount);
    }
    
    // Si tenemos menos de las necesarias, devolvemos todas las que tenemos
    // (esto no debería ocurrir si pedimos suficientes extras en la API)
    console.warn(`No se pudieron obtener ${minCount} animes únicos para una sección.`);
    return animeList;
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
      <TrendingAnime animeList={trendingAnimes} />
      <RecommendedAnime animeList={upcomingAnimes} />
      <AlltimePopularAnime animeList={popularAnimes} />
      <CollectionsSection />
    </main>
  );
};

export default HomePage;