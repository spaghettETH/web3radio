import React from 'react';

const BackgroundSite: React.FC = () => {
  return (
    <div className="bg-black h-screen w-screen pointer-events-none relative">
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ backgroundImage: `url('/logo.svg')` }}
      >
      </div>
    </div>
  );
};

export default BackgroundSite;
