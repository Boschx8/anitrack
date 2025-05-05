import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';
import AnimeCard from './AnimeCard';
import LoadingSpinner from './LoadingSpinner';

const Catalog = () => {
  // Llista de gèneres predefinits
  const genres = [
    { id: 1, name: "Action" },
    { id: 2, name: "Adventure" },
    { id: 4, name: "Comedy" },
    { id: 8, name: "Drama" },
    { id: 10, name: "Fantasy" },
    { id: 14, name: "Horror" },
    { id: 7, name: "Mystery" },
    { id: 22, name: "Romance" },
    { id: 24, name: "Sci-Fi" }
  ];

  // Estats basics per animes
  const statuses = ["Airing", "Complete", "Upcoming"];
  
  // Classificacions d'edat
  const ratings = [
    { value: "g", label: "G - All Ages" },
    { value: "pg", label: "PG - Children" },
    { value: "pg13", label: "PG-13 " },
    { value: "r17", label: "R - 17+ " }
  ];

  // Estats per mostrar/amagar filtre en mòbil
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  
  // Filtre seleccionat
  const [genreFilter, setGenreFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [ratingFilter, setRatingFilter] = useState([]);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  
  // Estat per ordenar
  const [sortBy, setSortBy] = useState('popularity');
  
  // Estat per la llista d'animes
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Paginació
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Seccions plegades/desplegades
  const [yearOpen, setYearOpen] = useState(true);
  const [genresOpen, setGenresOpen] = useState(true);
  const [statusOpen, setStatusOpen] = useState(true);
  const [ratingOpen, setRatingOpen] = useState(true);

  // Carregar més animes
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(page + 1);
    }
  };

  // Canviar filtre gènere
  const handleGenreChange = (genreId) => {
    if (genreFilter.includes(genreId)) {
      setGenreFilter([]);
    } else {
      setGenreFilter([genreId]);
    }
    setPage(1);
    setAnimes([]);
  };

  // Canviar filtre estat
  const handleStatusChange = (status) => {
    if (statusFilter.includes(status)) {
      setStatusFilter([]);
    } else {
      setStatusFilter([status]);
    }
    setPage(1);
    setAnimes([]);
  };

  // Canviar filtre rating
  const handleRatingChange = (rating) => {
    if (ratingFilter.includes(rating)) {
      setRatingFilter([]);
    } else {
      setRatingFilter([rating]);
    }
    setPage(1);
    setAnimes([]);
  };

  // Canviar any
  const handleYearChange = (e) => {
    const year = parseInt(e.target.value);
    if (year >= 1940 && year <= new Date().getFullYear()) {
      setYearFilter(year);
      setPage(1);
      setAnimes([]);
    }
  };

  // Obtenir animes de l'API
  useEffect(() => {
    const getAnimes = async () => {
      try {
        setLoading(true);
        
        // URL base
        let url = `https://api.jikan.moe/v4/anime?page=${page}&limit=24`;
        
        // Afegir ordenació
        if (sortBy === 'popularity') {
          url += '&order_by=members&sort=desc';
        } else if (sortBy === 'title') {
          url += '&order_by=title&sort=asc';
        } else if (sortBy === 'newest') {
          url += '&order_by=start_date&sort=desc';
        } else if (sortBy === 'rating') {
          url += '&order_by=score&sort=desc';
        }
        
        // Afegir filtre per any si no és upcoming
        const isUpcoming = statusFilter.includes('Upcoming');
        if (yearFilter && !isUpcoming) {
          url += `&start_date=${yearFilter}-01-01&end_date=${yearFilter}-12-31`;
        }
        
        // Afegir filtre per gènere
        if (genreFilter.length > 0) {
          url += `&genres=${genreFilter[0]}`;
        }
        
        // Afegir filtre per estat
        if (statusFilter.length > 0) {
          if (statusFilter[0] === 'Airing') {
            url += '&status=airing';
          } else if (statusFilter[0] === 'Complete') {
            url += '&status=completed';
          } else if (statusFilter[0] === 'Upcoming') {
            url += '&status=upcoming';
          }
        }
        
        // Afegir filtre per rating
        if (ratingFilter.length > 0) {
          url += `&rating=${ratingFilter[0].toUpperCase()}`;
        }
        
        // Fer la petició
        const response = await fetch(url);
        
        // Comprovar si hi ha hagut algun error
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('Rate limit exceeded. Try again later.');
          } else {
            throw new Error(`Error ${response.status}`);
          }
        }
        
        // Processar dades
        const data = await response.json();
        const newAnimes = data.data || [];
        
        // Actualitzar llista d'animes
        if (page === 1) {
          setAnimes(newAnimes);
        } else {
          setAnimes([...animes, ...newAnimes]);
        }
        
        // Comprovar si hi ha més pàgines
        setHasMore(newAnimes.length === 24);
        
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    getAnimes();
  }, [page, sortBy, genreFilter, statusFilter, ratingFilter, yearFilter]);

  // Tornar a intentar si hi ha error
  const retry = () => {
    setError(null);
    setPage(1);
    setAnimes([]);
    setHasMore(true);
  };

  return (
    <div className="catalog-container">
      {/* Botó de filtres per mòbil */}
      <button 
        className="mobile-filters-toggle"
        onClick={() => setMobileFilterOpen(true)}
      >
        <Filter size={20} />
        <span>Filters</span>
      </button>

      {/* Barra lateral de filtres */}
      <aside className={`filters-sidebar ${mobileFilterOpen ? 'mobile-open' : ''}`}>
        <div className="filters-header-mobile">
          <h2>Filters</h2>
          <button 
            className="close-filters-btn"
            onClick={() => setMobileFilterOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <div className="filters-content">
          {/* Secció Any */}
          <div className="filter-section">
            <div 
              className="filter-header"
              onClick={() => setYearOpen(!yearOpen)}
            >
              <h3>Year</h3>
              {yearOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            <div className={`filter-options ${yearOpen ? '' : 'collapsed'}`}>
              <div className="year-filter">
                <input
                  type="number"
                  min="1940"
                  max={new Date().getFullYear()}
                  value={yearFilter}
                  onChange={handleYearChange}
                  className="year-input"
                  disabled={statusFilter.includes('Upcoming')}
                />
                {statusFilter.includes('Upcoming') && (
                  <p style={{ color: '#666', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    Year filter is disabled for upcoming anime
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Secció Gèneres */}
          <div className="filter-section">
            <div 
              className="filter-header"
              onClick={() => setGenresOpen(!genresOpen)}
            >
              <h3>Genres</h3>
              {genresOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            <div className={`filter-options ${genresOpen ? '' : 'collapsed'}`}>
              <div className="checkbox-group">
                {genres.map(genre => (
                  <label key={genre.id} className="filter-option">
                    <input
                      type="checkbox"
                      checked={genreFilter.includes(genre.id)}
                      onChange={() => handleGenreChange(genre.id)}
                    />
                    <span>{genre.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Secció Estat */}
          <div className="filter-section">
            <div 
              className="filter-header"
              onClick={() => setStatusOpen(!statusOpen)}
            >
              <h3>Status</h3>
              {statusOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            <div className={`filter-options ${statusOpen ? '' : 'collapsed'}`}>
              <div className="checkbox-group">
                {statuses.map(status => (
                  <label key={status} className="filter-option">
                    <input
                      type="checkbox"
                      checked={statusFilter.includes(status)}
                      onChange={() => handleStatusChange(status)}
                    />
                    <span>{status}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Secció Rating */}
          <div className="filter-section">
            <div 
              className="filter-header"
              onClick={() => setRatingOpen(!ratingOpen)}
            >
              <h3>Rating</h3>
              {ratingOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            <div className={`filter-options ${ratingOpen ? '' : 'collapsed'}`}>
              <div className="checkbox-group">
                {ratings.map(rating => (
                  <label key={rating.value} className="filter-option">
                    <input
                      type="checkbox"
                      checked={ratingFilter.includes(rating.value)}
                      onChange={() => handleRatingChange(rating.value)}
                    />
                    <span>{rating.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay per tancar filtres en mòbil */}
      {mobileFilterOpen && (
        <div 
          className="mobile-filters-overlay"
          onClick={() => setMobileFilterOpen(false)}
        />
      )}

      {/* Contingut principal */}
      <main className="catalog-content">
        <div className="catalog-header">
          <h1>Catalog</h1>
          <select 
            value={sortBy} 
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
              setAnimes([]);
            }}
            className="sort-select"
          >
            <option value="popularity">Sort by Popularity</option>
            <option value="title">Sort by Title</option>
            <option value="newest">Sort by Newest</option>
            <option value="rating">Sort by Rating</option>
          </select>
        </div>

        {/* Mostrar error si n'hi ha */}
        {error && (
          <div className="error-container" style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ marginBottom: '1rem' }}>{error}</p>
            <button 
              onClick={retry}
              className="login-btn"
              style={{ padding: '0.5rem 1rem' }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Mostrar spinner mentre carrega */}
        {loading && <LoadingSpinner />}

        {/* Mostrar animes */}
        {!loading && (
          <>
            <div className="catalog-grid">
              {animes.map(anime => (
                <AnimeCard
                  key={anime.mal_id}
                  anime={{
                    title: anime.title,
                    genre: anime.genres?.map(g => g.name).join(', '),
                    image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
                    mal_id: anime.mal_id
                  }}
                />
              ))}
            </div>

            {/* Missatge si no hi ha resultats */}
            {!error && animes.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                No results found for the selected filters.
              </div>
            )}
          </>
        )}
        
        {/* Botó per carregar més animes */}
        {!loading && !error && animes.length > 0 && hasMore && (
          <button 
            className="show-more-btn" 
            onClick={loadMore}
            disabled={loading}
          >
            Show More
          </button>
        )}
      </main>
    </div>
  );
};

export default Catalog;