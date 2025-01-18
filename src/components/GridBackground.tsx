import React from 'react';

const GridBackground: React.FC = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `
          linear-gradient(to bottom, #f0f0f0 200px, transparent 300px),
          linear-gradient(to right, #f0f0f0 1px, transparent 1px),
          linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)
        `,
        backgroundSize: `100% 100%, 20px 20px, 20px 20px`,
        zIndex: -1,
      }}
    />
  );
};

export default GridBackground; 