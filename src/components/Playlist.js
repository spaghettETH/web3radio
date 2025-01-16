import React, { useState, useEffect, useCallback } from "react";

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

// Fisher-Yates Shuffle Algorithm
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap
  }
  return shuffled;
};

const Playlist = ({ contract }) => {
  const [shuffledPlaylist, setShuffledPlaylist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch and shuffle playlist from the smart contract
  const fetchPlaylist = useCallback(async () => {
    if (!contract) return;
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching playlist...");
      const songIds = await contract.viewPlaylist();

      // Fetch song details for each ID
      const detailedSongs = await Promise.all(
        songIds.map(async (id) => {
          const song = await contract.songsById(id);
          return {
            id: song.id.toString(),
            title: song.title,
            uri: song.uri,
            img: song.img,
            isActive: song.isActive,
          };
        })
      );

      // Filter out inactive songs and shuffle
      const activeSongs = detailedSongs.filter((song) => song.isActive);
      setShuffledPlaylist(shuffleArray(activeSongs));
    } catch (error) {
      console.error("Error fetching playlist:", error);
      setError("Failed to fetch playlist. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [contract]);

  // Fetch playlist when the contract updates
  useEffect(() => {
    fetchPlaylist();
  }, [fetchPlaylist]);

  return (
    <div>
      <h2>Playlist</h2>
      {loading ? (
        <p>Loading playlist...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : shuffledPlaylist.length === 0 ? (
        <p>No audios available yet.</p>
      ) : (
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {shuffledPlaylist.map((song) => (
            <li key={song.id} style={{ marginBottom: "10px" }}>
              <strong>{song.title || "Untitled"}</strong> -{" "}
              <a
                href={resolveIpfsUri(song.uri)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Listen
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Playlist;
