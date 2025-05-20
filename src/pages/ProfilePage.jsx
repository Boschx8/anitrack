// ProfilePage.jsx
// Aquest component mostra la pàgina de perfil de l'usuari amb les seves llistes d'animes i estadístiques

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import AnimeCard from '../components/AnimeCard';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
      const response = await fetch(`https://anitrack-93bx.onrender.com/api/user-anime/${user.sub}`);
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
  const filteredAnimes = userAnimes.filter(anime => {
    if (activeTab === 'statistics') return true; // Mostrem tots els animes per les estadístiques
    return anime.status === activeTab;
  });

  // Component de Estadístiques
  const StatisticsTab = () => {
    // Colors per al gràfic circular
    const COLORS = ['#f59a9a', '#b19af5', '#f5e09a'];

    // Calculem les estadístiques
    const stats = React.useMemo(() => {
      // Si no hi ha animes, retornem estadístiques buides
      if (!userAnimes || userAnimes.length === 0) {
        return {
          statusCount: [],
          genreCount: [],
          genrePerCategory: { watching: [], completed: [], bookmarked: [] }
        };
      }

      // Comptem els animes per estat (watching, completed, bookmarked)
      const statusData = {
        watching: 0,
        completed: 0,
        bookmarked: 0
      };

      // Comptem els animes per gènere
      const genreData = {};
      
      // Comptem els gèneres per cada categoria (watching, completed, bookmarked)
      const genresByCategory = {
        watching: {},
        completed: {},
        bookmarked: {}
      };

      // Iterar sobre tots els animes de l'usuari
      userAnimes.forEach(anime => {
        // Incrementar el comptador d'estat
        if (anime.status) {
          statusData[anime.status]++;
        }

        // Processar gèneres (separats per comes)
        if (anime.genre) {
          const genres = anime.genre.split(', ');
          genres.forEach(genre => {
            if (genre) {
              // Sumem al còmput general de gèneres
              if (!genreData[genre]) {
                genreData[genre] = 0;
              }
              genreData[genre]++;
              
              // Sumem al còmput per categoria
              if (anime.status) {
                if (!genresByCategory[anime.status][genre]) {
                  genresByCategory[anime.status][genre] = 0;
                }
                genresByCategory[anime.status][genre]++;
              }
            }
          });
        }
      });

      // Convertir les dades d'estat a format per al gràfic
      const statusCount = Object.keys(statusData).map(key => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: statusData[key]
      }));

      // Convertir les dades de gènere a format per al gràfic
      // i ordenar-les per quantitat (de major a menor)
      const genreCount = Object.keys(genreData)
        .map(key => ({
          name: key,
          value: genreData[key]
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Limitar a top 5 gèneres
      
      // Preparar les dades de gèneres per categoria
      const genrePerCategory = {};
      Object.keys(genresByCategory).forEach(category => {
        genrePerCategory[category] = Object.keys(genresByCategory[category])
          .map(genre => ({
            name: genre,
            value: genresByCategory[category][genre]
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 3); // Top 3 gèneres per categoria
      });

      return {
        statusCount,
        genreCount,
        genrePerCategory
      };
    }, [userAnimes]);

    // Si no hi ha animes, mostrem un missatge
    if (!userAnimes || userAnimes.length === 0) {
      return (
        <div className="stats-empty">
          <p>No hi ha animes a la teva llista per mostrar estadístiques.</p>
        </div>
      );
    }

    return (
      <div className="user-stats">
        <div className="stats-container">
          {/* Gràfic d'estat dels animes */}
          <div className="stats-card">
            <h3>Anime status</h3>
            <div className="stats-chart">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.statusCount}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.statusCount.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} anime(s)`]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gràfic de gèneres més vistos */}
          <div className="stats-card">
            <h3>Top 5 Genres</h3>
            <div className="stats-chart">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={stats.genreCount}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <XAxis 
                    type="number" 
                    allowDecimals={false} 
                    tickCount={10}
                    domain={[0, 'dataMax']}
                  />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip formatter={(value) => [`${value} anime(s)`]} />
                  <Bar dataKey="value" fill="#54beff" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Nova secció: Gèneres preferits per categoria */}
        <h3 className="stats-section-title">Favourite genres by status</h3>
        <div className="stats-container">
          {/* Gèneres preferits: Watching */}
          {stats.genrePerCategory.watching.length > 0 && (
            <div className="stats-card">
              <h3>Watching</h3>
              <div className="top-genres-list">
                {stats.genrePerCategory.watching.map((genre, index) => (
                  <div key={index} className="genre-item">
                    <div className="genre-name">{genre.name}</div>
                    <div className="genre-bar-container">
                      <div 
                        className="genre-bar" 
                        style={{ 
                          width: `${(genre.value / Math.max(...stats.genrePerCategory.watching.map(g => g.value))) * 100}%`,
                          backgroundColor: '#f59a9a' 
                        }}
                      ></div>
                      <span className="genre-count">{genre.value}</span>
                    </div>
                  </div>
                ))}
                {stats.genrePerCategory.watching.length === 0 && (
                  <p className="no-data">No hi ha animes en aquesta categoria</p>
                )}
              </div>
            </div>
          )}
          
          {/* Gèneres preferits: Completed */}
          {stats.genrePerCategory.completed.length > 0 && (
            <div className="stats-card">
              <h3>Completed</h3>
              <div className="top-genres-list">
                {stats.genrePerCategory.completed.map((genre, index) => (
                  <div key={index} className="genre-item">
                    <div className="genre-name">{genre.name}</div>
                    <div className="genre-bar-container">
                      <div 
                        className="genre-bar" 
                        style={{ 
                          width: `${(genre.value / Math.max(...stats.genrePerCategory.completed.map(g => g.value))) * 100}%`,
                          backgroundColor: '#f5e09a' 
                        }}
                      ></div>
                      <span className="genre-count">{genre.value}</span>
                    </div>
                  </div>
                ))}
                {stats.genrePerCategory.completed.length === 0 && (
                  <p className="no-data">No hi ha animes en aquesta categoria</p>
                )}
              </div>
            </div>
          )}
          
          {/* Gèneres preferits: Bookmarked */}
          {stats.genrePerCategory.bookmarked.length > 0 && (
            <div className="stats-card">
              <h3>Bookmarked</h3>
              <div className="top-genres-list">
                {stats.genrePerCategory.bookmarked.map((genre, index) => (
                  <div key={index} className="genre-item">
                    <div className="genre-name">{genre.name}</div>
                    <div className="genre-bar-container">
                      <div 
                        className="genre-bar" 
                        style={{ 
                          width: `${(genre.value / Math.max(...stats.genrePerCategory.bookmarked.map(g => g.value))) * 100}%`,
                          backgroundColor: '#b19af5' 
                        }}
                      ></div>
                      <span className="genre-count">{genre.value}</span>
                    </div>
                  </div>
                ))}
                {stats.genrePerCategory.bookmarked.length === 0 && (
                  <p className="no-data">No hi ha animes en aquesta categoria</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Resum general */}
        <div className="stats-summary">
          <div className="stats-total">
            <h3>Total d'animes: {userAnimes.length}</h3>
          </div>
        </div>
      </div>
    );
  };

  // Renderitzem el component principal
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
        {/* Nova Pestanya "Statistics" */}
        <button 
          className={`tab ${activeTab === 'statistics' ? 'active' : ''}`}
          onClick={() => setActiveTab('statistics')}
        >
          Statistics
        </button>
      </div>

      {/* Contingut de la pestanya activa */}
      <div className="profile-content">
        {/* Mostrem el contingut segons l'estat de càrrega i la pestanya activa */}
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error: {error}</div>
        ) : activeTab === 'statistics' ? (
          // Contingut de la pestanya d'estadístiques
          <StatisticsTab />
        ) : filteredAnimes.length > 0 ? (
          // Graella d'animes per les altres pestanyes
          <div className="profile-anime-grid">
            {filteredAnimes.map((anime) => (
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
            ))}
          </div>
        ) : (
          // Missatge si no hi ha animes en aquesta categoria
          <div>No animes in this category</div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;