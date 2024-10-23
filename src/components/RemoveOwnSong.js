import React, { useState, useEffect } from 'react';

const RemoveOwnSong = ({ contract }) => {
  const [mySongs, setMySongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMySongs(); // Fetch the user's songs when the component loads
  }, [contract]);

  const fetchMySongs = async () => {
    try {
      setLoading(true);
      const [uris, titles] = await contract.mySongs();
      const songs = uris.map((uri, index) => ({
        uri,
        title: titles[index],
        index
      }));
      setMySongs(songs);
    } catch (error) {
      console.error("Error fetching songs:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeSong = async (index) => {
    try {
      const tx = await contract.removeOwnSong(index);
      await tx.wait();
      alert(`Song at index ${index} removed successfully!`);
      fetchMySongs(); // Refresh the song list after removal
    } catch (error) {
      console.error("Error removing song:", error);
      alert("Failed to remove the song. Make sure you are authorized to remove it.");
    }
  };

  if (loading) {
    return <p>Loading your songs...</p>;
  }

  return (
    <div>
      <h2>Your Submitted Songs</h2>
      {mySongs.length > 0 ? (
        <ul>
          {mySongs.map((song, index) => (
            <li key={index}>
              <strong>{song.title}</strong> - {song.uri}
              <button onClick={() => removeSong(song.index)}>Remove Song</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>You have not submitted any songs yet.</p>
      )}
    </div>
  );
};

export default RemoveOwnSong;