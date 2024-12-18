import React, { useState, useEffect } from 'react';

const SavesLeaderboard = ({ contract }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the leaderboard data from the smart contract
  const fetchLeaderboard = async () => {
    if (!contract) return;

    try {
      setLoading(true);
      setError(null);
      const [songs, scores] = await contract.mostSaved();

      // Format the leaderboard data for display
      const leaderboardData = songs.map((song, index) => ({
        id: index, // Optional: unique key for React rendering
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
  };

  // Fetch leaderboard data when the component mounts or the contract changes
  useEffect(() => {
    fetchLeaderboard();
  }, [contract]);

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
                href={song.uri.startsWith("ipfs://")
                  ? song.uri.replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/")
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
