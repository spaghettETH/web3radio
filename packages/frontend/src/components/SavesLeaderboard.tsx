import React, { useState, useEffect, useCallback } from "react";
import LeaderboardTable from "./LeaderboardTable";
import LoaderSkeleton from "./LoaderSkelethon";
import { useWeb3Radio } from "../context/Web3RadioContext";
import { useWeb3Context } from "@megotickets/wallet";
import { useAccount, readContract, config } from "@megotickets/core";
import { getPlaylistABI, getPlaylistAddress } from "../contracts/DecentralizePlaylist/contract";
// Helper to resolve IPFS URIs

interface SavesLeaderboardProps {
}
const SavesLeaderboard: React.FC<SavesLeaderboardProps> = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();
  const { loggedAs } = useWeb3Context();
  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async () => {
    const userWalletAddress = address || loggedAs;
    if (!userWalletAddress) {
      console.log("[fetchLeaderboard] -> No address found");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("[fetchLeaderboard] -> address", address);
      const songIds = await readContract(config, {
        address: getPlaylistAddress() as `0x${string}`,
        chainId: 10,
        abi: getPlaylistABI(),
        functionName: "viewPlaylist",
        account: userWalletAddress as `0x${string}`
      }) as Array<Number>; // Fetch all song IDs

      console.log("[fetchLeaderboard] -> songIds", songIds);
      const scores = await Promise.all(
        songIds.map(async (id: any) => {

          const score = await readContract(config, {
            address: getPlaylistAddress() as `0x${string}`,
            abi: getPlaylistABI(),
            chainId: 10,
            functionName: "songScores",
            args: [id],
            account: userWalletAddress as `0x${string}`
          }) as any;
          console.log("[fetchLeaderboard] -> id", id);
          console.log("[fetchLeaderboard] -> score", score);
          return {
            id: id.toString(),
            score: score.toString(),
          }
        })
      );

      const leaderboardData = await Promise.all(
        songIds.map(async (id: any, index: number) => {
          const song = await readContract(config, {
            address: getPlaylistAddress() as `0x${string}`,
            abi: getPlaylistABI(),
            chainId: 10,
            functionName: "songsById",
            args: [id]
          }) as any;
          console.log("[fetchLeaderboard] -> song", song, "index", index);
          return {
            id: song[0].toString(),
            title: song[3],
            uri: song[1],
            score: scores[index].score,
          };
        })
      );

      // Sort by score descending
      leaderboardData.sort((a, b) => b.score - a.score);

      setLeaderboard(leaderboardData);
    } catch (err) {
      console.error("[fetchLeaderboard] -> Error fetching leaderboard:", err);
      setError("Failed to fetch the leaderboard. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [address]);

  // Fetch leaderboard data on component mount or when contract changes
  useEffect(() => {
    console.log("[fetchLeaderboard] -> useEffect");
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
