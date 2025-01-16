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

const SavesLeaderboard = ({ contract }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async () => {
    if (!contract) return;

    setLoading(true);
    setError(null);

    try {
      const songIds = await contract.viewPlaylist(); // Fetch all song IDs
      const scores = await Promise.all(
        songIds.map(async (id) => ({
          id: id.toString(),
          score: (await contract.songScores(id)).toString(),
        }))
      );

      const leaderboardData = await Promise.all(
        songIds.map(async (id, index) => {
          const song = await contract.songsById(id);
          return {
            id: song.id.toString(),
            title: song.title,
            uri: song.uri,
            score: scores[index].score,
          };
        })
      );

      // Sort by score descending
      leaderboardData.sort((a, b) => b.score - a.score);

      setLeaderboard(leaderboardData);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError("Failed to fetch the leaderboard. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [contract]);

  // Fetch leaderboard data on component mount or when contract changes
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
              <strong>{song.title || "Untitled"}</strong> -{" "}
              <a
                href={resolveIpfsUri(song.uri)}
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
