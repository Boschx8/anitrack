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

  // Funció per eliminar duplicats per ID
  const removeDuplicates = (animeList) => {
    const seen = new Set();
    return animeList.filter(anime => {
      if (anime && anime.mal_id && !seen.has(anime.mal_id)) {
        seen.add(anime.mal_id);
        return true;
      }
      return false;
    });
  };

  // Funció per reemplaçar duplicats entre llistes
  const replaceDuplicates = (primaryList, secondaryList, limit = 6) => {
    // Obtenir ids de la llista primària
    const primaryIds = new Set(primaryList.map(anime => anime.mal_id));
    
    // Filtrar la llista secundària per obtenir només elements únics
    const uniqueSecondary = secondaryList.filter(anime => !primaryIds.has(anime.mal_id));
    
    // Si després de filtrar no tenim suficients elements a la llista primària
    if (primaryList.length < limit && uniqueSecondary.length > 0) {
      // Afegir elements de la llista secundària fins arribar al límit
      const neededElements = Math.min(limit - primaryList.length, uniqueSecondary.length);
      return [...primaryList, ...uniqueSecondary.slice(0, neededElements)];
    }
    
    return primaryList;
  };

  useEffect(() => {
    const fetchAnimeData = async () => {
      try {
        setLoading(true);
        
        // Primer fem la petició d'animes en tendència per evitar errors de rate limiting
        const trendingResponse = await fetch('https://api.jikan.moe/v4/top/anime?filter=airing&limit=10');
        const trendingData = await trendingResponse.json();
        // Demanem 10 elements per tenir alternatius si hi ha duplicats
        const trendingList = removeDuplicates(trendingData.data || []).slice(0, 6);
        
        // Esperem 1 segon per evitar errors de rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Després fem la petició d'animes propers
        const upcomingResponse = await fetch('https://api.jikan.moe/v4/seasons/upcoming?limit=10');
        const upcomingData = await upcomingResponse.json();
        // Eliminem duplicats interns a la llista d'upcoming
        let upcomingList = removeDuplicates(upcomingData.data || []);
        
        // Assegurem que no hi ha duplicats entre trending i upcoming
        const trendingIds = new Set(trendingList.map(anime => anime.mal_id));
        upcomingList = upcomingList.filter(anime => !trendingIds.has(anime.mal_id)).slice(0, 6);
        
        // Actualitzem els estats
        setTrendingAnimes(trendingList);
        setUpcomingAnimes(upcomingList);
        
        // Esperem un altre segon
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          // Fem la petició per obtenir els animes populars
          const popularResponse = await fetch('https://api.jikan.moe/v4/top/anime?filter=bypopularity&limit=24');
          
          if (!popularResponse.ok) {
            throw new Error(`Error: ${popularResponse.status}`);
          }
          
          const popularData = await popularResponse.json();
          
          // Obtenim tots els IDs que ja estem mostrant per evitar duplicats a popular
          const existingIds = new Set([
            ...trendingList.map(anime => anime.mal_id),
            ...upcomingList.map(anime => anime.mal_id)
          ]);
          
          // Filtrem els animes populars per evitar duplicats
          const uniquePopularList = (popularData.data || []).filter(
            anime => !existingIds.has(anime.mal_id)
          ).slice(0, 18);
          
          setPopularAnimes(uniquePopularList);
          
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
        <LoadingSpinner />
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