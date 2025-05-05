import React from 'react';
import HeroSection from '../components/HeroSection';
import RecommendedAnime from '../components/RecommendedAnime';
import TrendingAnime from '../components/TrendingAnime';
import CollectionsSection from '../components/CollectionsSection';
import AlltimePopularAnime from '../components/AlltimePopular';


const HomePage = () => {
  return (
    <main>
      <HeroSection />
      <TrendingAnime />
      <RecommendedAnime />
      <AlltimePopularAnime />
      <CollectionsSection />
      
    </main>
  );
};

export default HomePage;