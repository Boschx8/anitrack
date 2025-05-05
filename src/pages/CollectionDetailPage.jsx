import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AnimeCard from '../components/AnimeCard';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * Component CollectionDetailPage
 *
 * Aquest component mostra els detalls d'una col·lecció específica d'animes.
 * Gestiona la càrrega de dades, la visualització dels animes, i possibles errors.
 */
const CollectionDetailPage = () => {
  // Obtenim l'ID de la col·lecció dels paràmetres de la URL
  const { collectionId } = useParams();
  
  // Estats per gestionar les dades i l'estat de la pàgina
  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState(null);
  const [animes, setAnimes] = useState([]);
  const [error, setError] = useState(null);

  /**
   * Dades estàtiques de les col·leccions
   * 
   * Conté informació sobre cada col·lecció: títol, descripció
   * i l'endpoint de l'API per obtenir els animes corresponents.
   */
  const collectionsData = {
    'top-romance': {
      title: "Top 20 Romance Animes",
      description: "Discover the best love stories in the world of anime. These anime offer exciting stories about relationships, emotions, and special connections between characters.",
      apiEndpoint: "https://api.jikan.moe/v4/anime?genres=22&order_by=score&sort=desc&limit=20"
    },
    'top-adventure': {
      title: "The 5 Adventure Animes",
      description: "Embark on breathtaking journeys with these adventure anime. From exploring new lands to epic quests, these anime will take you to incredible worlds.",
      apiEndpoint: "https://api.jikan.moe/v4/anime?genres=2&order_by=score&sort=desc&limit=5"
    },
    'top-comedy': {
      title: "Top 10 Comedy Animes",
      description: "Laughter is guaranteed with these comical anime. With hilarious situations and endearing characters, these anime will brighten your day with their unique humor.",
      apiEndpoint: "https://api.jikan.moe/v4/anime?genres=4&order_by=score&sort=desc&limit=10"
    },
    'top-action': {
      title: "Top 15 Action Animes",
      description: "Adrenaline and excitement with the best action anime. Spectacular fights, powerful characters and thrilling stories that will keep you on the edge of your seat.",
      apiEndpoint: "https://api.jikan.moe/v4/anime?genres=1&order_by=score&sort=desc&limit=15"
    },
    'top-fantasy': {
      title: "Top 10 Fantasy Animes",
      description: "Immerse yourself in magical worlds with these fantasy animes. Mythical creatures, unique magic systems, and adventures in unknown lands await you.",
      apiEndpoint: "https://api.jikan.moe/v4/anime?genres=10&order_by=score&sort=desc&limit=10"
    },
    'top-scifi': {
      title: "Top 8 Sci-Fi Animes",
      description: "The future, advanced technology and space exploration in these science fiction anime. Discover futuristic worlds, artificial intelligence and more.",
      apiEndpoint: "https://api.jikan.moe/v4/anime?genres=24&order_by=score&sort=desc&limit=8"
    }
  };

  /**
   * Hook d'efecte per carregar les dades de la col·lecció
   * 
   * Aquest efecte s'executa quan canvia l'ID de la col·lecció.
   * Realitza una petició a l'API externa (Jikan API) per obtenir
   * els animes segons els criteris definits a collectionsData.
   */
  useEffect(() => {
    const fetchCollectionData = async () => {
      try {
        // Iniciem l'estat de càrrega
        setLoading(true);
        setError(null);

        // Obtenim la informació de la col·lecció actual
        const currentCollection = collectionsData[collectionId];
        
        // Comprovem si existeix la col·lecció
        if (!currentCollection) {
          throw new Error("Collection not found");
        }

        setCollection(currentCollection);

        // Afegim un petit retard per evitar problemes amb límits de l'API
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Realitzem la petició a l'API externa
        const response = await fetch(currentCollection.apiEndpoint);
        
        // Gestionem possibles errors de l'API
        if (response.status === 429) {
          throw new Error("API request limit exceeded. Please try again later.");
        }

        if (!response.ok) {
          throw new Error(`Error ${response.status}: Could not load list`);
        }

        // Processem i guardem les dades rebudes
        const data = await response.json();
        setAnimes(data.data || []);
      } catch (error) {
        console.error("Error fetching collection:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionData();
  }, [collectionId]);

  /**
  
   * 
   * Mostrem un spinner durant la càrrega, un missatge d'error
   * si hi ha hagut algun problema, o el contingut si tot va bé.
   */
  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="error-container">
        <h1>Error</h1>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="retry-button"
        >
          Try again.
        </button>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="error-container">
        <h1>Collection not found</h1>
        <p>The collection you are looking for does not exist.</p>
      </div>
    );
  }

  /**
   * Renderització principal de la pàgina
   * 
   * Mostra la capçalera amb el títol i descripció,
   * i una graella amb les targetes dels animes de la col·lecció.
   */
  return (
    <div className="collection-detail-page">
      <div className="collection-detail-header">
        <h1>{collection.title}</h1>
        <p>{collection.description}</p>
      </div>

      {/* Graella d'animes utilitzant el component AnimeCard */}
      <div className="anime-grid collection-grid">
        {animes.map((anime) => (
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

      {/* Missatge si no hi ha resultats */}
      {animes.length === 0 && !loading && !error && (
        <div className="no-results">
          <p>No anime found for this collection.</p>
        </div>
      )}
    </div>
  );
};

export default CollectionDetailPage;