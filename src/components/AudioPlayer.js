import React, { useState, useEffect } from "react";

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
    <div style={{ textAlign: "center" }}>
      {currentSong ? (
        <div>
          <h3>Now Playing: {currentSong.title}</h3>
          {currentSong.img && (
            <img
              src={resolveIpfsUri(currentSong.img)}
              alt={`${currentSong.title} Cover`}
              style={{
                width: "300px",
                height: "300px",
                objectFit: "cover",
                borderRadius: "10px",
                marginBottom: "10px",
              }}
            />
          )}
          <audio
            src={resolveIpfsUri(currentSong.uri)}
            controls
            autoPlay
            onEnded={handleEnded}
            style={{ width: "100%", maxWidth: "400px" }}
          />
        </div>
      ) : (
        <p>No songs available in the playlist. Please add songs to get started.</p>
      )}
    </div>
  );
};

export default AudioPlayer;
