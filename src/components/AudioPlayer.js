import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';

// Function to resolve IPFS URI with a CORS proxy
const resolveIpfsUriWithCors = (uri) => {
  // Use the CORS proxy for the IPFS URI
  const corsProxy = 'https://cors-anywhere.herokuapp.com/';
  if (uri.startsWith("ipfs://")) {
    const ipfsHash = uri.replace("ipfs://", "");
    return `${corsProxy}https://ipfs.io/ipfs/${ipfsHash}`;
  }
  return uri;
};

const AudioPlayer = ({ playlist }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleEnded = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % playlist.length);
  };

  useEffect(() => {
    if (playlist.length > 0 && currentIndex >= playlist.length) {
      setCurrentIndex(0); // Reset when the playlist updates
    }
  }, [playlist]);

  return (
    <div>
      <h2>Now Playing</h2>
      {playlist.length > 0 ? (
        <div>
          <h3>{playlist[currentIndex].title}</h3>
          <ReactPlayer
            url={resolveIpfsUriWithCors(playlist[currentIndex].uri)}  // Resolve IPFS URI with CORS proxy
            controls
            playing
            config={{
              file: {
                attributes: {
                  controlsList: 'nodownload',
                },
              },
            }}
            height="50px"
            width="100%"
            onEnded={handleEnded}  // Move to next song when finished
          />
        </div>
      ) : (
        <p>No song currently available.</p>
      )}
    </div>
  );
};

export default AudioPlayer;
