import React from 'react';

function HeroSection() {
  return (
    <div className="relative h-[60vh] bg-cover bg-center" style={{ backgroundImage: 'url("https://picsum.photos/seed/flight/1920/1080")' }}>
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="relative h-full flex flex-col justify-center items-center text-white text-center px-4">
        <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-bold mb-4">Find Your Perfect Flight</h1>
        <p className="text-[clamp(1rem,2vw,1.25rem)] mb-8 max-w-2xl">Discover amazing deals on flights to destinations around the world. Book your next journey with us.</p>
      </div>
    </div>
  );
}

export default HeroSection;    