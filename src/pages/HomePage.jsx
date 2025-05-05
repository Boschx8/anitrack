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

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [trending, upcoming, popular] = await Promise.all([
          getTrendingAnime(),
          getUpcomingAnime(),
          getAllTimePopularAnime()
        ]);
        
        // Remove duplicates across sections
        const processedUpcoming = removeDuplicates(upcoming, trending);
        const processedPopular = removeDuplicates(popular, [...trending, ...processedUpcoming]);
        
        // Set state with processed data
        setTrendingAnimes(trending);
        setUpcomingAnimes(processedUpcoming);
        setPopularAnimes(processedPopular);
        
      } catch (error) {
        console.error('Error fetching anime data:', error);
        setError('Failed to load anime data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Helper function to remove duplicates between sections
  const removeDuplicates = (newAnimes, existingAnimes) => {
    return newAnimes.filter(newAnime => 
      !existingAnimes.some(existing => existing.mal_id === newAnime.mal_id)
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
      <TrendingAnime animeList={trendingAnimes} />
      <RecommendedAnime animeList={upcomingAnimes} />
      <AlltimePopularAnime animeList={popularAnimes} />
      <CollectionsSection />
    </main>
  );
};

export default HomePage;