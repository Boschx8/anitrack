import React from 'react';
import { Link } from 'react-router-dom';

const CollectionsSection = () => {
  const collections = [
    {
      id: 'top-adventure',
      title: "The 5 Adventure Animes",
      cards: [
        { image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20-LxrhhIQyiE60.jpg" },
        { image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx11061-NpIIobuQNbJW.png" },
        { image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg" }
      ]
    },
    {
      id: 'top-romance',
      title: "Top 20 Romance animes",
      cards: [
        { image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx170942-B77wUSM1jQTu.jpg" },
        { image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx172190-i1IqizIUcKkN.jpg" },
        { image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx178533-md2BV8esGezM.jpg" }
      ]
    },
    {
      id: 'top-comedy',
      title: "Top 10 Comedy animes",
      cards: [
        { image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20996-kBEGEGdeK1r7.jpg" },
        { image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx172258-bhQ5BypDqfKB.jpg" },
        { image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx177709-jBQ965JZG0l8.png" }
      ]
    }
  ];

  return (
    <section className="collections">
      {collections.map((collection, index) => (
        <Link 
          to={`/collections/${collection.id}`} 
          key={index} 
          className="collection-card"
        >
          <h3>{collection.title}</h3>
          <div className="stacked-cards">
            {collection.cards.map((card, cardIndex) => (
              <div key={cardIndex} className={`card card${cardIndex + 1}`}>
                <img src={card.image} alt={`Card ${cardIndex + 1}`} />
              </div>
            ))}
          </div>
        </Link>
      ))}
    </section>
  );
};

export default CollectionsSection;