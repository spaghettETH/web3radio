import React, { useState, useEffect, useCallback } from "react";

const SavesLeaderboard = ({ contract }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch the leaderboard data from the smart contract
  const fetchLeaderboard = useCallback(async () => {
    if (!contract) return;

    setLoading(true);
    setError(null);

    try {
      const [songs, scores] = await contract.mostSaved();

      // Filter only active songs and format the leaderboard data
      const leaderboardData = songs
        .filter((song) => song.isActive) // Only include active songs
        .map((song, index) => ({
          id: song.id, // Use song ID for React keys
          title: song.title,
          uri: song.uri,
          score: scores[index].toString(), // Convert score to string for safe rendering
        }));

      setLeaderboard(leaderboardData);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError("Failed to fetch the leaderboard. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [contract]);

  // Fetch leaderboard data when the component mounts or the contract changes
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return (
    <div>
      <h2>Most Saved Audios</h2>

      {/* Loading State */}
      {loading && <p>Loading leaderboard...</p>}

      {/* Error State */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Leaderboard Display */}
      {!loading && !error && leaderboard.length > 0 ? (
        <ol style={{ marginTop: "10px" }}>
          {leaderboard.map((song) => (
            <li key={song.id} style={{ marginBottom: "10px" }}>
              <strong>{song.title}</strong> -{" "}
              <a
                href={
                  song.uri.startsWith("ipfs://")
                    ? `https://cloudflare-ipfs.com/ipfs/${song.uri.slice(7)}`
                    : song.uri
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                Listen
              </a>{" "}
              (Saves: {song.score})
            </li>
          ))}
        </ol>
      ) : (
        !loading && <p>No saved audio data available.</p>
      )}
    </div>
  );
};

export default SavesLeaderboard;
