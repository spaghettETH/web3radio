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

const MySaves = ({ contract, currentSong }) => {
  const [savedSongs, setSavedSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user's saved songs from the smart contract
  const fetchMySaves = useCallback(async () => {
    if (!contract) return;
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching saved song IDs...");
      const savedSongIds = await contract.retrieveMySaves();

      // Fetch details for each saved song
      const formattedSaves = await Promise.all(
        savedSongIds.map(async (id) => {
          const song = await contract.songsById(id);
          return {
            id: song.id.toString(),
            title: song.title,
            uri: song.uri,
            img: song.img,
            isActive: song.isActive, // Respect active status
          };
        })
      );

      setSavedSongs(formattedSaves.filter((song) => song.isActive)); // Exclude inactive songs
    } catch (error) {
      console.error("Error fetching saved songs:", error);
      setError("Failed to fetch saved songs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [contract]);

  // Save the currently playing song to the user's saves
  const handleSaveSong = async () => {
    if (!currentSong || !currentSong.id || !contract) {
      alert("No song is currently playing or the song data is incomplete.");
      return;
    }

    try {
      console.log(`Saving song: ${currentSong.title}`);
      const tx = await contract.addToMySaves(currentSong.id);
      await tx.wait();

      alert(`Song "${currentSong.title}" saved successfully!`);
      fetchMySaves(); // Refresh the saved songs list after saving
    } catch (error) {
      console.error("Error saving the song:", error);
      alert("Failed to save the song. Ensure you're connected and authorized.");
    }
  };

  // Fetch saved songs when the contract updates
  useEffect(() => {
    fetchMySaves();
  }, [fetchMySaves]);

  return (
    <div>
      <h2>My Saved Audios</h2>
      <button
        onClick={handleSaveSong}
        disabled={!currentSong || !currentSong.id}
        style={{ marginBottom: "10px" }}
      >
        Save Current Audio
      </button>
      {loading ? (
        <p>Loading your saved audios...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : savedSongs.length > 0 ? (
        <ul>
          {savedSongs.map((song) => (
            <li key={song.id}>
              <strong>{song.title}</strong> -{" "}
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
      ) : (
        <p>You have no saved audios yet.</p>
      )}
    </div>
  );
};

export default MySaves;
