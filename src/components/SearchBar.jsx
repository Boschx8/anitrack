// SearchBar.jsx
// Aquest component permet cercar animes i mostra els resultats en un desplegable

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Bookmark, Check, Eye, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ToastProvider from './ToastProvider';

const SearchBar = () => {
  // Estats bàsics
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Referències per controlar el comportament
  const dropdownRef = useRef(null);
  const searchTimeout = useRef(null);
  
  // Obtenim l'usuari actual
  const { user } = useAuth();

  // Funció per netejar la cerca
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
  };

  // Funció per afegir un anime a la llista de l'usuari
  const addAnimeToList = async (anime, status, showToast) => {
    // Comprovar si l'usuari està autenticat
    if (!user) {
      showToast('Please login to add animes to your list', 'error');
      return;
    }

    try {
      // Preparar les dades per enviar
      const animeData = {
        malId: anime.mal_id.toString(),
        title: anime.title,
        image: anime.images.jpg.large_image_url,
        genre: anime.genres?.map(g => g.name).join(', '),
        status
      };

      // Enviar les dades al servidor
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user-anime/${user.sub}/anime`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(animeData)
      });

      // Comprovar si la resposta és correcta
      if (!response.ok) {
        throw new Error('Failed to update anime status');
      }

      // Crear missatge segons l'acció
      let message = '';
      if (status === 'bookmarked') {
        message = `${anime.title} has been added to your bookmarks!`;
      } else if (status === 'completed') {
        message = `${anime.title} has been marked as completed!`;
      } else if (status === 'watching') {
        message = `${anime.title} has been added to your watching list!`;
      }
      
      // Mostrar missatge d'èxit
      showToast(message, 'success');

    } catch (error) {
      // Mostrar error si hi ha hagut algun problema
      console.error('Error:', error);
      showToast('Failed to update anime status', 'error');
    }
  };

  // Efecte per detectar clics fora del desplegable i tancar-lo
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    // Afegim l'escoltador d'esdeveniments
    document.addEventListener('mousedown', handleClickOutside);
    
    // Netegem l'escoltador quan es desmunta el component
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Efecte per fer la cerca quan canvia la consulta
  useEffect(() => {
    // Cancel·lem el timeout anterior si existeix
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Si la cerca està buida, no fem res
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    // Activem l'estat de càrrega
    setLoading(true);
    
    // Creem un timeout per esperar que l'usuari acabi d'escriure
    searchTimeout.current = setTimeout(async () => {
      try {
        // Fem la petició a l'API
        const response = await fetch(
          `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5`
        );

        // Si l'API ens limita, esperem i tornem a provar
        if (response.status === 429) {
          setTimeout(async () => {
            const retryResponse = await fetch(
              `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5`
            );
            const data = await retryResponse.json();
            setResults(data.data || []);
          }, 1000);
          return;
        }

        // Processem les dades i actualitzem l'estat
        const data = await response.json();
        setResults(data.data || []);
        setShowDropdown(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    // Netegem el timeout quan canvia la consulta
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [query]);

  // Renderitzem el component
  return (
    <ToastProvider>
      {({ showToast }) => (
        <div className="search-wrapper" ref={dropdownRef}>
          {/* Camp de cerca */}
          <div className="search-input-wrapper">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anime..."
              className="search-input"
            />
            {/* Icona de cerca o de càrrega */}
            <div className="search-icon">
              {loading ? (
                <Loader2 className="loading-icon" />
              ) : (
                <Search />
              )}
            </div>
            {/* Botó per netejar la cerca */}
            {query && (
              <button 
                className="clear-button"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Desplegable amb els resultats */}
          {showDropdown && results.length > 0 && (
            <div className="search-dropdown">
              {results.map((anime) => (
                <div 
                  key={anime.mal_id} 
                  className="search-result-item"
                  onClick={() => {
                    // Crear URL amigable i navegar a la pàgina de detalls
                    const urlTitle = anime.title
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/^-+|-+$/g, '');
                    window.location.href = `/anime/${urlTitle}`;
                  }}
                >
                  <div className="search-result-content">
                    {/* Imatge de l'anime */}
                    <img
                      src={anime.images.jpg.image_url}
                      alt={anime.title}
                      className="result-image"
                    />
                    <div className="result-info">
                      {/* Títol i gèneres */}
                      <h4 className="result-title">{anime.title}</h4>
                      <p className="result-genres">
                        {anime.genres?.map(g => g.name).join(', ')}
                      </p>
                      {/* Botons d'acció */}
                      <div className="result-actions">
                        {/* Botó per afegir als marcadors */}
                        <button 
                          className="action-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addAnimeToList(anime, 'bookmarked', showToast);
                          }}
                          title="Add to bookmarks"
                        >
                          <Bookmark size={16} />
                        </button>
                        {/* Botó per marcar com a completat */}
                        <button 
                          className="action-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addAnimeToList(anime, 'completed', showToast);
                          }}
                          title="Mark as completed"
                        >
                          <Check size={16} />
                        </button>
                        {/* Botó per afegir a watching */}
                        <button 
                          className="action-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addAnimeToList(anime, 'watching', showToast);
                          }}
                          title="Add to watching"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </ToastProvider>
  );
};

export default SearchBar;