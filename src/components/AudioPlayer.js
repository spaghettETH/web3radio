import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';

// Function to resolve IPFS URIs via Cloudflare IPFS gateway
const resolveIpfsUri = (uri) => {
  if (uri.startsWith("ipfs://")) {
    return uri.replace("ipfs://", "https://spaghetteth.mypinata.cloud/ipfs/");
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
            url={resolveIpfsUri(playlist[currentIndex].uri)}  // Use the resolved IPFS URI
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

