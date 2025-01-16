import React, { useState, useEffect, useRef } from "react";
import PlayBar from './PlayBar';

// Helper to resolve IPFS URIs
const resolveIpfsUri = (uri) => {
  if (!uri) {
    console.error("Invalid URI:", uri);
    return null;
  }
  return uri.startsWith("ipfs://")
    ? `https://dweb.link/ipfs/${uri.slice(7)}`
    : uri;
};

const AudioPlayer = ({ playlist, setCurrentSong }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef(null);

  // Update the current song when the index changes or playlist changes
  useEffect(() => {
    if (playlist.length > 0) {
      // Validate currentIndex or default to the first song in the shuffled playlist
      const validIndex = currentIndex < playlist.length ? currentIndex : 0;
      setCurrentIndex(validIndex);
      console.log("Setting current song:", playlist[validIndex]); // Debugging
      setCurrentSong(playlist[validIndex]);
    }
  }, [currentIndex, playlist, setCurrentSong]);

  // Handle song completion
  const handleEnded = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % playlist.length);
  };

  // Get the current song or handle an empty playlist
  const currentSong = playlist[currentIndex] || null;

  return (
    <div className="w-full">
      {currentSong && <p className="text-left w-full text-base">(Now Playing)</p>}
      <div className="flex flex-col border-2 border-black w-full rounded-lg">
        {currentSong ? (
          <div>
            {currentSong.img && (
              <img
                src={resolveIpfsUri(currentSong.img)}
                alt={`${currentSong.title} Cover`}
                className="w-auto h-full object-cover rounded-lg mb-2.5 mx-auto"
              />
            )}
            <audio
              ref={audioRef}
              src={resolveIpfsUri(currentSong.uri)}
              controls
              autoPlay
              onEnded={handleEnded}
              style={{
                width: "100%",
                borderRadius: "0px"
              }}
            />
            <PlayBar audioRef={audioRef} currentSong={currentSong} />
          </div>
        ) : (
          <p>No songs available in the playlist. Please add songs to get started.</p>
        )}
      </div>
    </div>
  );
};

export default AudioPlayer;
