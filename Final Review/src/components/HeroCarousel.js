import React, { useState, useEffect } from 'react';
import './HeroCarousel.css';

const carouselData = [
  {
    id: 1,
    eventId: "e1",
    title: "Tech Expo 2026",
    subtitle: "Experience the future of innovation and technology.",
    image: "/assets/tech_banner.png",
    category: "Tech"
  },
  {
    id: 2,
    eventId: "e7",
    title: "Harmony Music Fest",
    subtitle: "Feel the rhythm of the most awaited musical night.",
    image: "/assets/music_banner.png",
    category: "Music"
  },
  {
    id: 3,
    eventId: "e6",
    title: "Modern Art Gallery",
    subtitle: "Explore the depths of contemporary creativity.",
    image: "/assets/art_banner.png",
    category: "Arts"
  }
];

function HeroCarousel({ onExplore }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselData.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hero-carousel fade-in">
      {carouselData.map((slide, index) => (
        <div 
          key={slide.id} 
          className={`carousel-slide ${index === currentIndex ? 'active' : ''}`}
          style={{ backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.2)), url(${slide.image})` }}
        >
          <div className="carousel-content">
            <span className="carousel-badge">{slide.category}</span>
            <h2>{slide.title}</h2>
            <p>{slide.subtitle}</p>
            <button 
              className="btn btn-primary carousel-btn"
              onClick={() => onExplore(slide.eventId, slide.category)}
            >
              Explore Now
            </button>
          </div>
        </div>
      ))}
      <div className="carousel-dots">
        {carouselData.map((_, index) => (
          <div 
            key={index} 
            className={`dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          ></div>
        ))}
      </div>
    </div>
  );
}

export default HeroCarousel;
