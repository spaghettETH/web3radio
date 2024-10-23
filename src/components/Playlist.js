import React from 'react';

const Playlist = ({ playlist }) => {
  return (
    <div>
      <h2>Playlist</h2>
      {playlist.length === 0 ? (
        <p>No songs available yet.</p>
      ) : (
        <ul>
          {playlist.map((song, index) => (
            <li key={index}>
              <strong>{song.title}</strong> - <a href={song.uri} target="_blank" rel="noopener noreferrer">Listen</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Playlist;
