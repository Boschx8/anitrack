// ProfilePage.jsx
// Aquest component mostra la pàgina de perfil de l'usuari amb les seves llistes d'animes

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import AnimeCard from '../components/AnimeCard';

const ProfilePage = () => {
  // Obtenim l'usuari del context d'autenticació
  const { user } = useAuth();

  // Estats per gestionar les dades i la interfície
  const [activeTab, setActiveTab] = useState('watching');
  const [userAnimes, setUserAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Funció per obtenir els animes de l'usuari del servidor
  const getAnimes = async () => {
    // Si no hi ha usuari, no fem res
    if (!user) return;

    try {
      // Fem la petició al servidor
      const response = await fetch(`http://localhost:5000/api/user-anime/${user.sub}`);
      const data = await response.json();

      // Si hi ha hagut algun error, llancem una excepció
      if (!response.ok) {
        throw new Error('Failed to fetch user animes');
      }

      // Actualitzem l'estat amb els animes obtinguts o un array buit
      setUserAnimes(data.animes || []);
    } catch (error) {
      // Mostrem l'error a la consola i l'emmagatzemem a l'estat
      console.error('Error fetching user animes:', error);
      setError(error.message);
    } finally {
      // Finalitzem la càrrega
      setLoading(false);
    }
  };

  // Efecte per carregar els animes quan el component es munta o canvia l'usuari
  useEffect(() => {
    getAnimes();
  }, [user]);

  // Funció per actualitzar l'estat d'un anime a la interfície sense fer peticions API
  const updateAnimeStatus = (animeId, newStatus) => {
    setUserAnimes(prevAnimes => {
      return prevAnimes.map(anime => {
        // Si trobem l'anime, actualitzem el seu estat
        if (anime.malId === animeId) {
          return { ...anime, status: newStatus };
        }
        // Si no, el retornem sense canvis
        return anime;
      });
    });
  };
  
  // Filtrem els animes segons la pestanya activa
  const filteredAnimes = userAnimes.filter(anime => anime.status === activeTab);

  // Renderitzem el component
  return (
    <div className="profile-page">
      {/* Banner amb la informació de l'usuari */}
      <div className="profile-banner">
        <div className="profile-info">
          {/* Avatar de l'usuari */}
          <img 
            src={user?.picture || '/default-avatar.png'} 
            alt={user?.name} 
            className="profile-avatar"
          />
          {/* Nom de l'usuari */}
          <div className="profile-name">
            <h1>{user?.name}</h1>
          </div>
        </div>
      </div>

      {/* Pestanyes per filtrar els animes */}
      <div className="profile-tabs">
        {/* Pestanya "Watching" */}
        <button 
          className={`tab ${activeTab === 'watching' ? 'active' : ''}`}
          onClick={() => setActiveTab('watching')}
        >
          Watching
        </button>
        {/* Pestanya "Bookmarked" */}
        <button 
          className={`tab ${activeTab === 'bookmarked' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookmarked')}
        >
          Bookmarked
        </button>
        {/* Pestanya "Completed" */}
        <button 
          className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
      </div>

      {/* Graella d'animes */}
      <div className="profile-anime-grid">
        {/* Mostrem el contingut segons l'estat de càrrega i si hi ha errors */}
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error: {error}</div>
        ) : filteredAnimes.length > 0 ? (
          // Mostrem cada anime filtrat
          filteredAnimes.map((anime) => (
            <AnimeCard
              key={anime.malId}
              anime={{
                title: anime.title,
                image: anime.image,
                genre: anime.genre,
                mal_id: anime.malId
              }}
              onStatusUpdate={updateAnimeStatus}
              onDelete={(animeId) => {
                // Eliminem l'anime de la llista
                setUserAnimes(prevAnimes => 
                  prevAnimes.filter(anime => anime.malId !== animeId)
                );
              }}
              isProfileCard={true}
            />
          ))
        ) : (
          // Missatge si no hi ha animes en aquesta categoria
          <div>No animes in this category</div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;