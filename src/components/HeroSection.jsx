import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';

const heroContent = [
  {
    title: "Attack on Titan",
    description: "In a world where humanity lives inside cities surrounded by enormous walls due to the Titans, giant humanoid creatures who devour humans seemingly without reason, a young boy aims to break out of humanity's cage.",
    imageUrl: "https://cloudfront-eu-central-1.images.arcpublishing.com/diarioas/4MEWI2K4D5HSFIIAXRURHLBXQU.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=MGRm4IzK1SQ"
  },
  {
    title: "Demon Slayer",
    description: "After a demon attack leaves his family slain and his sister turned, Tanjiro Kamado's journey as a demon slayer begins. Armed with his sword and his sister's humanity, he searches for a way to turn her human again.",
    imageUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-YfZhKBUDDS6L.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=VQGCKyvzIM4"
  },
  {
    title: "Jujutsu Kaisen",
    description: "Yuji Itadori is an ordinary high school student who joins his school's Occult Club for fun. However, when they accidentally unseal a cursed object, his world is thrown into the realm of Cursed Spirits and sorcerers.",
    imageUrl: "https://wallpapers.com/images/hd/anime-all-characters-hd-abdorpf0wfv8nbkf.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=4A_X-Dvl0ws"
  },
  {
    title: "One Piece",
    description: "Monkey D. Luffy sets out with his loyal crew on an epic adventure to find the legendary One Piece treasure and become the Pirate King. Along the way, they face powerful enemies and form unbreakable bonds.",
    imageUrl: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/9c2e9d59-ee54-490e-bf96-5497f587844f/dghv910-fead846e-1076-4ae0-b86d-9451c670bc66.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzljMmU5ZDU5LWVlNTQtNDkwZS1iZjk2LTU0OTdmNTg3ODQ0ZlwvZGdodjkxMC1mZWFkODQ2ZS0xMDc2LTRhZTAtYjg2ZC05NDUxYzY3MGJjNjYuanBnIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.cwKXUKd53MxuupDVvXPqtsL91qtQNtxThFrw7pBeYJU",
    trailerUrl: "https://www.youtube.com/watch?v=S8_YwFLCh4U"
  },
  {
    title: "My Hero Academia",
    description: "In a world where 80% of the population has superhuman abilities called 'Quirks', Izuku Midoriya dreams of becoming a hero despite being born powerless. His life changes when he meets the world's greatest hero.",
    imageUrl: "https://www.chromethemer.com/download/hd-wallpapers/my-hero-academia-3840x2160.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=EPVkcwyLQQ8"
  }
];

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const rotationInterval = 10000; 

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === heroContent.length - 1 ? 0 : prevIndex + 1
        );
        setIsTransitioning(false);
      }, 500);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, []);

  const handleWatchTrailer = () => {
    window.open(heroContent[currentIndex].trailerUrl, '_blank');
  };

  return (
    <div className="hero">
      <div className="hero-video-container">
        <div className={`hero-overlay ${isTransitioning ? 'fade-out' : 'fade-in'}`} />
        <img 
          key={currentIndex}
          src={heroContent[currentIndex].imageUrl}
          alt={heroContent[currentIndex].title}
          className="hero-video"
        />
      </div>

      <div className={`hero-content ${isTransitioning ? 'slide-out' : 'slide-in'}`}>
        <h2>{heroContent[currentIndex].title}</h2>
        <p>{heroContent[currentIndex].description}</p>
        <div className="hero-buttons">
          <button className="watch-trailer" onClick={handleWatchTrailer}>
            <Play size={20} />
            <span>Watch Trailer</span>
          </button>
         
        </div>
      </div>
    </div>
  );
};

export default HeroSection;