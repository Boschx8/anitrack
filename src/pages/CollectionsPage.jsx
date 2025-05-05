import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const CollectionsPage = () => {
  const [loading, setLoading] = useState(false);

  const collections = [
    {
      id: 'top-romance',
      title: "Top 20 Romance Animes",
      description: "Explore the best love stories in the world of anime",
      image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx170942-B77wUSM1jQTu.jpg",
      category: "romance"
    },
    {
      id: 'top-adventure',
      title: "The 5 Adventure Animes",
      description: "Discover must-read stories of adventure and exploration",
      image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20-LxrhhIQyiE60.jpg",
      category: "adventure"
    },
    {
      id: 'top-comedy',
      title: "Top 10 Comedy Animes",
      description: "The funniest anime that will make you laugh",
      image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20996-kBEGEGdeK1r7.jpg",
      category: "comedy"
    },
    {
      id: 'top-action',
      title: "Top 15 Action Animes",
      description: "The most exciting and intense action anime",
      image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg",
      category: "action"
    },
    {
      id: 'top-fantasy',
      title: "Top 10 Fantasy Animes",
      description: "Imaginary worlds and fantastic creatures in these essential anime",
      image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx108465-1ANspF1EWyFx.jpg",
      category: "fantasy"
    },
    {
      id: 'top-scifi',
      title: "Top 8 Sci-Fi Animes",
      description: "Space travel, robots and dystopian futures in these science fiction anime",
      image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-60q1B6GK2Ghb.jpg",
      category: "sci-fi"
    }
  ];

  return (
    <div className="collections-page">
      <div className="collections-header">
        <h1>Collections</h1>
        <p>Explore our curated collections of anime by genre and category</p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="collections-grid">
          {collections.map((collection) => (
            <Link 
              to={`/collections/${collection.id}`} 
              key={collection.id}
              className="collection-item"
            >
              <div className="collection-item-image">
                <img src={collection.image} alt={collection.title} />
                <div className="collection-overlay"></div>
              </div>
              <div className="collection-item-info">
                <h2>{collection.title}</h2>
                <p>{collection.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionsPage;