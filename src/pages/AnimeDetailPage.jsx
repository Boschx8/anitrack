// Pàgina per mostrar la informació detallada d'un anime

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Star, Eye, Bookmark, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ToastProvider from '../components/ToastProvider';
import LoadingSpinner from '../components/LoadingSpinner';

const AnimeDetailPage = () => {
  const { title } = useParams();
  const { user } = useAuth();
  
  // Estats principals
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Estats per a les pestanyes
  const [characters, setCharacters] = useState([]);
  const [staff, setStaff] = useState([]);
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingTab, setLoadingTab] = useState(false);

  // Efecte per carregar la informació bàsica de l'anime
  useEffect(() => {
    async function fetchAnimeData() {
      try {
        setLoading(true);
        
        // Busquem l'anime pel títol
        const searchResponse = await fetch(`https://api.jikan.moe/v4/anime?q=${title.replace(/-/g, ' ')}&limit=1`);
        
        if (!searchResponse.ok) {
          throw new Error('No s\'ha pogut trobar l\'anime');
        }
        
        const searchData = await searchResponse.json();
        
        if (!searchData.data || searchData.data.length === 0) {
          throw new Error('Anime no trobat');
        }
        
        // Obtenim l'ID de l'anime i després les dades completes
        const animeId = searchData.data[0].mal_id;
        const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/full`);
        
        if (!response.ok) {
          throw new Error('Error carregant les dades de l\'anime');
        }
        
        const data = await response.json();
        setAnime(data.data);
        
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAnimeData();
  }, [title]);

  // Funció per carregar dades quan canviem de pestanya
  async function loadTabData(tab) {
    // Si ja tenim les dades d'aquesta pestanya, no cal fer res
    if (
      (tab === 'characters' && characters.length > 0) ||
      (tab === 'staff' && staff.length > 0) ||
      (tab === 'stats' && stats) ||
      (tab === 'reviews' && reviews.length > 0) ||
      !anime
    ) {
      return;
    }

    setLoadingTab(true);
    
    try {
      // Esperar una mica per evitar problemes de rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // URL per a la petició segons la pestanya
      let url = '';
      
      if (tab === 'characters') {
        url = `https://api.jikan.moe/v4/anime/${anime.mal_id}/characters`;
        const response = await fetch(url);
        const data = await response.json();
        setCharacters(data.data);
      } 
      else if (tab === 'staff') {
        url = `https://api.jikan.moe/v4/anime/${anime.mal_id}/staff`;
        const response = await fetch(url);
        const data = await response.json();
        setStaff(data.data);
      } 
      else if (tab === 'stats') {
        url = `https://api.jikan.moe/v4/anime/${anime.mal_id}/statistics`;
        const response = await fetch(url);
        const data = await response.json();
        setStats(data.data);
      } 
      else if (tab === 'reviews') {
        url = `https://api.jikan.moe/v4/anime/${anime.mal_id}/reviews`;
        const response = await fetch(url);
        const data = await response.json();
        setReviews(data.data.slice(0, 15)); // Limitem a 15 ressenyes
      }
      
    } catch (error) {
      console.error(`Error carregant dades de ${tab}:`, error);
    } finally {
      setLoadingTab(false);
    }
  }

  // Funció per canviar de pestanya
  function handleTabChange(tab) {
    setActiveTab(tab);
    loadTabData(tab);
  }

  // Funció per afegir l'anime a una llista (watching, completed, bookmarked)
  async function addToList(status, showToast) {
    // Comprovar si l'usuari està connectat
    if (!user) {
      showToast('Has d\'iniciar sessió per afegir animes a la teva llista', 'error');
      return;
    }

    // Comprovar si tenim dades de l'anime
    if (!anime) {
      showToast('No es pot realitzar l\'acció en aquest moment', 'error');
      return;
    }

    try {
      // Crear objecte amb les dades de l'anime
      const animeData = {
        malId: anime.mal_id.toString(),
        title: anime.title,
        image: anime.images.jpg.large_image_url,
        genre: anime.genres.map(g => g.name).join(', '),
        status
      };

      // Enviar dades al servidor
      const response = await fetch(`https://anitrack-93bx.onrender.com/api/user-anime/${user.sub}/anime`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(animeData)
      });

      // Comprovar si hi ha hagut algun error
      if (!response.ok) {
        throw new Error('Error updating anime status');
      }

      // Mostrar missatge segons l'acció
      let message = '';
      if (status === 'bookmarked') {
        message = `${anime.title} has been added to your bookmarks!`;
      } else if (status === 'completed') {
        message = `${anime.title} has been marked as completed!`;
      } else if (status === 'watching') {
        message = `${anime.title} has been added to your watching list!`;
      }
      
      showToast(message, 'success');

    } catch (error) {
      console.error('Error:', error);
      showToast('Error updating anime status', 'error');
    }
  }

  // Mostrar spinner mentre carrega
  if (loading) {
    return <LoadingSpinner />;
  }

  // Mostrar error si n'hi ha hagut
  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Tornar a intentar
        </button>
      </div>
    );
  }

  // Mostrar missatge si no hi ha dades
  if (!anime) {
    return <div>No s'ha trobat cap anime</div>;
  }

  return (
    <ToastProvider>
      {({ showToast }) => (
        <div className="anime-detail-page">
          {/* Banner amb imatge de fons i info bàsica */}
          <div 
            className="anime-banner" 
            style={{ 
              backgroundImage: `url(${anime.images.jpg.large_image_url})`,
              backgroundPosition: 'center',
              backgroundSize: 'cover'
            }}
          >
            <div className="banner-overlay">
              <div className="anime-main-info">
                {/* Imatge de l'anime */}
                <img 
                  src={anime.images.jpg.large_image_url} 
                  alt={anime.title} 
                  className="anime-poster"
                />
                
                {/* Informació principal */}
                <div className="anime-info">
                  <h1>{anime.title}</h1>
                  
                  {/* Títol en japonès si existeix */}
                  {anime.title_japanese && (
                    <h2 className="japanese-title">{anime.title_japanese}</h2>
                  )}
                  
                  {/* Estadístiques bàsiques */}
                  <div className="anime-stats">
                    {anime.score && <span className="rating">{anime.score} ★</span>}
                    {anime.aired.from && (
                      <span className="year">
                        {new Date(anime.aired.from).getFullYear()}
                      </span>
                    )}
                    {anime.episodes && (
                      <span className="episodes">{anime.episodes} Episodes</span>
                    )}
                    {anime.duration && (
                      <span className="duration">{anime.duration}</span>
                    )}
                  </div>
                  
                  {/* Botons d'acció */}
                  <div className="action-buttons">
                    {/* Botó per veure el tràiler */}
                    {anime.trailer?.url && (
                      <a 
                        href={anime.trailer.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="watch-trailer"
                      >
                        <Play size={20} />
                        Watch Trailer
                      </a>
                    )}
                    
                    {/* Botons per a les llistes */}
                    <div className="list-action-buttons">
                      {/* Botó "Watching" */}
                      <button 
                        className="add-to-watching"
                        onClick={() => addToList('watching', showToast)}
                      >
                        <Eye size={20} />
                        Watching
                      </button>
                      
                      {/* Botó "Completed" */}
                      <button 
                        className="add-to-completed"
                        onClick={() => addToList('completed', showToast)}
                      >
                        <Check size={20} />
                        Completed
                      </button>
                      
                      {/* Botó "Bookmark" */}
                      <button 
                        className="add-to-bookmarked"
                        onClick={() => addToList('bookmarked', showToast)}
                      >
                        <Bookmark size={20} />
                        Bookmark
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contingut i pestanyes */}
          <div className="anime-content">
            {/* Navegació de pestanyes */}
            <div className="content-tabs">
              <button 
                className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button 
                className={`tab ${activeTab === 'characters' ? 'active' : ''}`}
                onClick={() => handleTabChange('characters')}
              >
                Characters
              </button>
              <button 
                className={`tab ${activeTab === 'staff' ? 'active' : ''}`}
                onClick={() => handleTabChange('staff')}
              >
                Staff
              </button>
              <button 
                className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
                onClick={() => handleTabChange('stats')}
              >
                Stats
              </button>
              <button 
                className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => handleTabChange('reviews')}
              >
                Reviews
              </button>
            </div>

            {/* Contingut de la pestanya activa */}
            <div className="tab-content">
              {/* Contingut de la pestanya Overview */}
              {activeTab === 'overview' && (
                <div className="overview-content">
                  <div className="main-info">
                    <h3>Synopsis</h3>
                    <p>{anime.synopsis}</p>

                    <div className="info-grid">
                      <div className="info-item">
                        <h4>Type</h4>
                        <p>{anime.type}</p>
                      </div>
                      <div className="info-item">
                        <h4>Episodes</h4>
                        <p>{anime.episodes}</p>
                      </div>
                      <div className="info-item">
                        <h4>Status</h4>
                        <p>{anime.status}</p>
                      </div>
                      <div className="info-item">
                        <h4>Aired</h4>
                        <p>
                          {new Date(anime.aired.from).toLocaleDateString()} to {
                            anime.aired.to ? new Date(anime.aired.to).toLocaleDateString() 
                            : 'Present'
                          }
                        </p>
                      </div>
                      <div className="info-item">
                        <h4>Genres</h4>
                        <p>{anime.genres.map(genre => genre.name).join(', ')}</p>
                      </div>
                      <div className="info-item">
                        <h4>Studios</h4>
                        <p>{anime.studios.map(studio => studio.name).join(', ')}</p>
                      </div>
                      {anime.source && (
                        <div className="info-item">
                          <h4>Source</h4>
                          <p>{anime.source}</p>
                        </div>
                      )}
                      {anime.rating && (
                        <div className="info-item">
                          <h4>Rating</h4>
                          <p>{anime.rating}</p>
                        </div>
                      )}
                      {anime.season && (
                        <div className="info-item">
                          <h4>Season</h4>
                          <p>{`${anime.season.charAt(0).toUpperCase() + anime.season.slice(1)} ${anime.year}`}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Contingut de la pestanya Characters */}
              {activeTab === 'characters' && (
                <div className="characters-grid">
                  {loadingTab ? (
                    <LoadingSpinner />
                  ) : characters.length > 0 ? (
                    characters.map((char) => (
                      <div key={char.character.mal_id} className="character-card">
                        <img 
                          src={char.character.images.jpg.image_url} 
                          alt={char.character.name}
                          className="character-image" 
                        />
                        <div className="character-info">
                          <h4>{char.character.name}</h4>
                          <p className="role">{char.role}</p>
                          {char.voice_actors && char.voice_actors.length > 0 && (
                            <div className="voice-actor">
                              <small>VA: {char.voice_actors[0].person.name}</small>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div>No hi ha informació sobre els personatges</div>
                  )}
                </div>
              )}

              {/* Contingut de la pestanya Staff */}
              {activeTab === 'staff' && (
                <div className="staff-grid">
                  {loadingTab ? (
                    <LoadingSpinner />
                  ) : staff.length > 0 ? (
                    staff.map((person) => (
                      <div key={person.person.mal_id} className="staff-card">
                        <img 
                          src={person.person.images.jpg.image_url} 
                          alt={person.person.name}
                          className="staff-image" 
                        />
                        <div className="staff-info">
                          <h4>{person.person.name}</h4>
                          <p className="position">{person.positions.join(', ')}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div>No hi ha informació sobre l'equip de producció</div>
                  )}
                </div>
              )}

              {/* Contingut de la pestanya Stats */}
              {activeTab === 'stats' && (
                <div className="stats-container">
                  {loadingTab ? (
                    <LoadingSpinner />
                  ) : stats ? (
                    <>
                      <div className="stats-card">
                        <h4>Ratings Distribution</h4>
                        <div className="ratings-chart">
                          {Object.entries(stats.scores).map(([score, data]) => (
                            <div key={score} className="rating-bar">
                              <div className="score">{score}</div>
                              <div className="bar">
                                <div 
                                  className="fill" 
                                  style={{width: `${(data.percentage)}%`}}
                                />
                              </div>
                              <div className="percentage">{data.percentage.toFixed(1)}%</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="stats-summary">
                        <div className="stat-item">
                          <h5>Completed</h5>
                          <p>{stats.completed.toLocaleString()}</p>
                        </div>
                        <div className="stat-item">
                          <h5>Watching</h5>
                          <p>{stats.watching.toLocaleString()}</p>
                        </div>
                        <div className="stat-item">
                          <h5>Plan to Watch</h5>
                          <p>{stats.plan_to_watch.toLocaleString()}</p>
                        </div>
                        <div className="stat-item">
                          <h5>Dropped</h5>
                          <p>{stats.dropped.toLocaleString()}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div>No hi ha estadístiques disponibles</div>
                  )}
                </div>
              )}

              {/* Contingut de la pestanya Reviews */}
              {activeTab === 'reviews' && (
                <div className="reviews-container">
                  {loadingTab ? (
                    <LoadingSpinner />
                  ) : reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.mal_id} className="review-card">
                        <div className="review-header">
                          <img 
                            src={review.user.images.jpg.image_url} 
                            alt={review.user.username}
                            className="reviewer-image" 
                          />
                          <div className="reviewer-info">
                            <h4>{review.user.username}</h4>
                            <div className="review-score">
                              <Star size={16} className="star-icon" />
                              <span>{review.score}</span>
                            </div>
                          </div>
                        </div>
                        <p className="review-text">{review.review}</p>
                        <div className="review-footer">
                          <span>{new Date(review.date).toLocaleDateString()}</span>
                          <div className="review-reactions">
                            <span>👍 {review.reactions.nice || 0}</span>
                            <span>💡 {review.reactions.informative || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div>No hi ha ressenyes disponibles</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </ToastProvider>
  );
};

export default AnimeDetailPage;