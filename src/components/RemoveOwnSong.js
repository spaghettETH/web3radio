import React, { useEffect } from "react";

const RemoveOwnSong = ({ contract, mySongs, fetchUserSongs }) => {
  useEffect(() => {
    if (contract) {
      console.log("Contract detected in RemoveOwnSong. Fetching user songs...");
      fetchUserSongs();
    } else {
      console.error("Contract not initialized in RemoveOwnSong.");
    }
  }, [contract, fetchUserSongs]);

  const removeSong = async (songId) => {
    if (!contract) {
      alert("Smart contract not initialized.");
      return;
    }

    try {
      console.log(`Removing song with ID: ${songId}`); // Debugging
      const tx = await contract.removeOwnSong(songId);
      await tx.wait();
      alert("Song removed successfully!");
      fetchUserSongs(); // Refresh the song list
    } catch (error) {
      console.error("Error removing song:", error);
      alert(`Failed to remove the song. Error: ${error.message}`);
    }
  };

  console.log("Rendered mySongs in RemoveOwnSong:", mySongs); // Debugging

  return (
    <div>
      <h2>Your Submitted Audios</h2>
      {mySongs && mySongs.length > 0 ? (
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {mySongs.map((song) => (
            <li key={song.id} style={{ marginBottom: "10px" }}>
              <strong>{song.title || "Untitled"}</strong>
              <button
                onClick={() => removeSong(song.id)}
                style={{
                  marginLeft: "10px",
                  padding: "5px 10px",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No audios found in your submissions.</p>
      )}
    </div>
  );
};

export default RemoveOwnSong;
