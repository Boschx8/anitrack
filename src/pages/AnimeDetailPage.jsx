// AnimeDetailPage.jsx
// This component displays detailed information about a specific anime

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Star, Eye, Bookmark, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ToastProvider from '../components/ToastProvider';
import LoadingSpinner from '../components/LoadingSpinner';

const AnimeDetailPage = () => {
  const { title } = useParams();
  
  // Main State Management
  const [anime, setAnime] = useState(null);
  const [animeId, setAnimeId] = useState(null);

    // Tab Content States
  const [characters, setCharacters] = useState([]);
  const [staff, setStaff] = useState([]);
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);

   // UI States
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // User authentication state
  const { user } = useAuth();

  // Fetches basic anime information using the title from URL

  useEffect(() => {
    const fetchAnimeDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const searchResponse = await fetch(`https://api.jikan.moe/v4/anime?q=${title.replace(/-/g, ' ')}&limit=1`);
        
        if (!searchResponse.ok) {
          throw new Error('Failed to find anime');
        }

        const searchData = await searchResponse.json();
        
        if (!searchData.data || searchData.data.length === 0) {
          throw new Error('Anime not found');
        }

        // Get the ID from the search result
        const foundAnimeId = searchData.data[0].mal_id;
        setAnimeId(foundAnimeId);

      

        // Now fetch the full details using the ID
        const response = await fetch(`https://api.jikan.moe/v4/anime/${foundAnimeId}/full`);
        
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }

        if (!response.ok) {
          throw new Error('Failed to fetch anime details');
        }

        const data = await response.json();
        setAnime(data.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimeDetails();
  }, [title]);

  const fetchTabData = async (tab) => {
    if (
      (tab === 'characters' && characters.length > 0) ||
      (tab === 'staff' && staff.length > 0) ||
      (tab === 'stats' && stats) ||
      (tab === 'reviews' && reviews.length > 0) ||
      !animeId // prevent fetching without an ID
    ) {
      return;
    }

    try {
      setTabLoading(true);
      
      // Add a delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let endpoint = '';
      
      switch (tab) {
        case 'characters':
          endpoint = `https://api.jikan.moe/v4/anime/${animeId}/characters`;
          const charResponse = await fetch(endpoint);
          if (charResponse.ok) {
            const data = await charResponse.json();
            setCharacters(data.data);
          }
          break;

        case 'staff':
          endpoint = `https://api.jikan.moe/v4/anime/${animeId}/staff`;
          const staffResponse = await fetch(endpoint);
          if (staffResponse.ok) {
            const data = await staffResponse.json();
            setStaff(data.data);
          }
          break;

        case 'stats':
          endpoint = `https://api.jikan.moe/v4/anime/${animeId}/statistics`;
          const statsResponse = await fetch(endpoint);
          if (statsResponse.ok) {
            const data = await statsResponse.json();
            setStats(data.data);
          }
          break;

        case 'reviews':
          endpoint = `https://api.jikan.moe/v4/anime/${animeId}/reviews`;
          const reviewsResponse = await fetch(endpoint);
          if (reviewsResponse.ok) {
            const data = await reviewsResponse.json();
            setReviews(data.data.slice(0, 15)); // Limit to 15 reviews
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${tab} data:`, error);
    } finally {
      setTabLoading(false);
    }
  };

  // Updates active tab and triggers data fetch if needed
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetchTabData(tab);
  };

   // Manages adding anime to user lists (watching, completed, bookmarked)
  const handleAnimeAction = async (status, showToast) => {
    if (!user) {
      showToast('Please login to add animes to your list', 'error');
      return;
    }

    if (!anime) {
      showToast('Unable to perform action at this time', 'error');
      return;
    }

    try {
      const animeData = {
        malId: anime.mal_id.toString(),
        title: anime.title,
        image: anime.images.jpg.large_image_url,
        genre: anime.genres.map(g => g.name).join(', '),
        status
      };

      const response = await fetch(`http://localhost:5000/api/user-anime/${user.sub}/anime`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(animeData)
      });

      if (!response.ok) {
        throw new Error('Failed to update anime status');
      }

      let message = '';
      switch (status) {
        case 'bookmarked':
          message = `${anime.title} has been added to your bookmarks!`;
          break;
        case 'completed':
          message = `${anime.title} has been marked as completed!`;
          break;
        case 'watching':
          message = `${anime.title} has been added to your watching list!`;
          break;
        default:
          message = `${anime.title} has been updated!`;
      }
      showToast(message, 'success');

    } catch (error) {
      console.error('Error:', error);
      showToast('Failed to update anime status', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  if (!anime) {
    return <div>No anime found</div>;
  }

  // Tab Content Render Functions
  const renderCharactersTab = () => (
    <div className="characters-grid">
      {tabLoading ? (
        <LoadingSpinner />
      ) : (
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
      )}
    </div>
  );

  const renderStaffTab = () => (
    <div className="staff-grid">
      {tabLoading ? (
        <LoadingSpinner />
      ) : (
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
      )}
    </div>
  );

  const renderStatsTab = () => (
    <div className="stats-container">
      {tabLoading ? (
        <LoadingSpinner />
      ) : stats && (
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
      )}
    </div>
  );

  const renderReviewsTab = () => (
    <div className="reviews-container">
      {tabLoading ? (
        <LoadingSpinner />
      ) : (
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
      )}
    </div>
  );

  // Render
  return (
    <ToastProvider>
      {({ showToast }) => (
        <div className="anime-detail-page">
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
                <img 
                  src={anime.images.jpg.large_image_url} 
                  alt={anime.title} 
                  className="anime-poster"
                />
                <div className="anime-info">
                  <h1>{anime.title}</h1>
                  {anime.title_japanese && (
                    <h2 className="japanese-title">{anime.title_japanese}</h2>
                  )}
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
                  <div className="action-buttons">
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
                    <div className="list-action-buttons">
                      <button 
                        className="add-to-watching"
                        onClick={() => handleAnimeAction('watching', showToast)}
                      >
                        <Eye size={20} />
                        Watching
                      </button>
                      <button 
                        className="add-to-completed"
                        onClick={() => handleAnimeAction('completed', showToast)}
                      >
                        <Check size={20} />
                        Completed
                      </button>
                      <button 
                        className="add-to-bookmarked"
                        onClick={() => handleAnimeAction('bookmarked', showToast)}
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

          <div className="anime-content">
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

            <div className="tab-content">
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
              {activeTab === 'characters' && renderCharactersTab()}
              {activeTab === 'staff' && renderStaffTab()}
              {activeTab === 'stats' && renderStatsTab()}
              {activeTab === 'reviews' && renderReviewsTab()}
            </div>
          </div>
        </div>
      )}
    </ToastProvider>
  );
};

export default AnimeDetailPage;