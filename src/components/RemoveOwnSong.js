import React, { useEffect } from "react";

const RemoveOwnSong = ({ contract, mySongs, fetchUserSongs }) => {
  // Fetch user's songs when the contract is ready or updated
  useEffect(() => {
    if (contract) {
      console.log("Contract detected. Fetching user songs..."); // Debugging
      fetchUserSongs();
    } else {
      console.log("Contract not yet initialized."); // Debugging
    }
  }, [contract, fetchUserSongs]);

  const removeSong = async (songId) => {
    try {
      console.log(`Attempting to remove song with ID: ${songId}`); // Debugging
      const tx = await contract.removeOwnSong(songId);
      await tx.wait();
      alert(`Song removed successfully!`);
      fetchUserSongs(); // Refresh song list after removal
    } catch (error) {
      console.error("Error removing song:", error);
      alert(`Failed to remove the song. ${error.message}`);
    }
  };

  console.log("mySongs in RemoveOwnSong component:", mySongs); // Debugging

  return (
    <div>
      <h2>Your Submitted Audios</h2>
      {mySongs && mySongs.length > 0 ? (
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {mySongs
            .filter((song) => song && song.isActive) // Only show valid and active songs
            .map((song) => (
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
