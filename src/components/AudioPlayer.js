import React, { useState, useEffect } from "react";

const resolveIpfsUri = (uri) => {
  if (!uri) return null;
  return uri.startsWith("ipfs://")
    ? `https://dweb.link/ipfs/${uri.slice(7)}`
    : uri;
};

const AudioPlayer = ({ playlist, setCurrentSong }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (playlist.length > 0) {
      setCurrentSong(playlist[currentIndex]);
    }
  }, [currentIndex, playlist, setCurrentSong]);

  const handleEnded = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % playlist.length);
  };

  return (
    <div style={{ textAlign: "center" }}>
      {playlist.length > 0 ? (
        <div>
          <h3>Now Playing: {playlist[currentIndex].title}</h3>
          <img
            src={resolveIpfsUri(playlist[currentIndex].img)}
            alt="Song Cover"
            style={{ width: "300px", height: "300px", objectFit: "cover" }}
          />
          <audio
            src={resolveIpfsUri(playlist[currentIndex].uri)}
            controls
            autoPlay
            onEnded={handleEnded}
            style={{ marginTop: "10px", width: "100%" }}
          />
        </div>
      ) : (
        <p>No songs available in the playlist.</p>
      )}
    </div>
  );
};

export default AudioPlayer;
