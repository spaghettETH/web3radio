import React, { useState, useEffect, useCallback } from "react";
import LeaderboardTable from "./LeaderboardTable";
import LoaderSkeleton from "./LoaderSkelethon";
import { useWeb3Radio } from "../context/Web3RadioContext";
// Helper to resolve IPFS URIs

interface SavesLeaderboardProps { 
}
const SavesLeaderboard: React.FC<SavesLeaderboardProps> = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { playlistContract:contract } = useWeb3Radio();
  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async () => {
    if (!contract) return;

    setLoading(true);
    setError(null);

    try {
      const songIds = await contract.viewPlaylist(); // Fetch all song IDs
      const scores = await Promise.all(
        songIds.map(async (id:any) => ({
          id: id.toString(),
          score: (await contract.songScores(id)).toString(),
        }))
      );

      const leaderboardData = await Promise.all(
        songIds.map(async (id:any, index:number) => {
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
    <div className="w-full bg-black p-6">
      <div className="flex flex-row items-center gap-2">
        <h2 className="text-white text-2xl font-bold uppercase">Most Saved</h2>
        <p className="text-white text-sm uppercase">Leaderboard</p>
      </div>

      {/* Loading State */}
      {
        loading && <LoaderSkeleton />
      }

      {/* Error State */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Leaderboard Display */}
      {!loading && !error && leaderboard.length > 0 ? (
        <LeaderboardTable leaderboard={leaderboard} />
      ) : (
        !loading && <p className="text-white">No saved audio data available.</p>
      )}
    </div>
  );
};

export default SavesLeaderboard;
