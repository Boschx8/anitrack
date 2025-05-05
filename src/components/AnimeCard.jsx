// AnimeCard.jsx
// Aquest component mostra una targeta amb informació d'un anime i botons per afegir-lo a diferents llistes

import React, { useState } from 'react';
import { Bookmark, Check, Eye, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import ToastProvider from './ToastProvider';

const AnimeCard = ({ anime, onStatusUpdate = () => {}, onDelete = () => {}, isProfileCard = false }) => {
  // Estat per saber si el ratolí està sobre la targeta
  const [isHovered, setIsHovered] = useState(false);
  
  // Obtenim l'usuari i la navegació
  const { user } = useAuth();
  const navigate = useNavigate();

  // Funció per afegir l'anime a una llista (watching, completed, bookmarked)
  const addToList = async (status, showToast) => {
    // Comprovar si l'usuari està connectat
    if (!user) {
      showToast('Please login to add animes to your list', 'error');
      return;
    }

    // Crear objecte amb les dades de l'anime
    const animeId = anime.mal_id || Date.now().toString();
    const animeData = {
      malId: animeId,
      title: anime.title || 'Unknown Title',
      image: anime.image || anime.images?.jpg?.large_image_url || '',
      genre: anime.genre || 'No Genre',
      status
    };

    try {
      // Enviar dades al servidor
      const response = await fetch(`http://localhost:5000/api/user-anime/${user.sub}/anime`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(animeData)
      });

      // Comprovar si la resposta és correcta
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      // Actualitzar interfície
      onStatusUpdate(animeId, status);
      
      // Mostrar missatge segons l'acció
      let message = '';
      if (status === 'bookmarked') {
        message = `${anime.title} has been added to your bookmarks!`;
      } else if (status === 'completed') {
        message = `${anime.title} has been marked as completed!`;
      } else if (status === 'watching') {
        message = `${anime.title} has been added to your watching list!`;
      }
      
      // Mostrar notificació
      showToast(message);

    } catch (error) {
      // Mostrar error si hi ha hagut algun problema
      console.error('Error:', error);
      showToast('Failed to update anime status: ' + error.message, 'error');
    }
  };

  // Funció per eliminar l'anime de la llista
  const removeFromList = async (showToast) => {
    // Comprovar si l'usuari està connectat
    if (!user) return;

    try {
      // Enviar petició d'eliminació al servidor
      const response = await fetch(
        `http://localhost:5000/api/user-anime/${user.sub}/anime/${anime.mal_id}`, 
        { method: 'DELETE' }
      );

      // Comprovar si la resposta és correcta
      if (!response.ok) {
        throw new Error('Failed to delete anime');
      }

      // Actualitzar interfície i mostrar missatge
      onDelete(anime.mal_id);
      showToast(`${anime.title} has been removed from your list`);
    } catch (error) {
      // Mostrar error si hi ha hagut algun problema
      console.error('Error deleting anime:', error);
      showToast('Failed to delete anime', 'error');
    }
  };

  // Funció per anar a la pàgina de detalls de l'anime
  const goToDetail = () => {
    if (anime.title) {
      // Crear URL amigable a partir del títol
      const urlTitle = anime.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') 
        .replace(/^-+|-+$/g, ''); 
      
      // Navegar a la pàgina de detalls
      navigate(`/anime/${urlTitle}`);
    }
  };

  // Renderització del component
  return (
    <ToastProvider>
      {({ showToast }) => (
        <div 
          className="anime-card"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={goToDetail}
        >
          {/* Imatge de l'anime */}
          <img src={anime.image || anime.images?.jpg?.large_image_url} alt={anime.title} />
          
          {/* Overlay amb botons d'acció */}
          <div className={`anime-card-overlay ${isHovered ? 'show' : ''}`}>
            {/* Botó per guardar als marcadors */}
            <button 
              className="action-button"
              onClick={(e) => {
                e.stopPropagation();
                addToList('bookmarked', showToast);
              }}
            >
              <Bookmark size={20} />
            </button>
            
            {/* Botó per marcar com completat */}
            <button 
              className="action-button"
              onClick={(e) => {
                e.stopPropagation();
                addToList('completed', showToast);
              }}
            >
              <Check size={20} />
            </button>
            
            {/* Botó per afegir a "watching" */}
            <button 
              className="action-button"
              onClick={(e) => {
                e.stopPropagation();
                addToList('watching', showToast);
              }}
            >
              <Eye size={20} />
            </button>

            {/* Botó per eliminar (només si és una targeta del perfil) */}
            {isProfileCard && (
              <button 
                className="action-button delete-button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromList(showToast);
                }}
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Informació de l'anime */}
          <h4>{anime.title}</h4>
          <p>{anime.genre}</p>
        </div>
      )}
    </ToastProvider>
  );
};

export default AnimeCard;