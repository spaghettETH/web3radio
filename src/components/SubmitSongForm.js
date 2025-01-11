import React, { useState } from "react";

const SubmitSongForm = ({ contract, fetchPlaylist, fetchUserSongs }) => {
  const [title, setTitle] = useState("");
  const [audioUri, setAudioUri] = useState("");
  const [imageUri, setImageUri] = useState("");
  const [loading, setLoading] = useState(false);
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const normalizeLink = (url) => {
    if (url.includes("dropbox.com")) {
      return url.replace("dl=0", "raw=1");
    }
    if (url.includes("drive.google.com")) {
      const match = url.match(/\/file\/d\/([^/]+)\//);
      if (match && match[1]) {
        return `https://drive.google.com/uc?id=${match[1]}&export=download`;
      }
      const altMatch = url.match(/id=([^&]+)/);
      if (altMatch && altMatch[1]) {
        return `https://drive.google.com/uc?id=${altMatch[1]}&export=download`;
      }
    }
    return url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !audioUri || !imageUri || !disclaimerChecked) {
      setErrorMessage("All fields are required and the disclaimer must be checked.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const normalizedAudioUri = normalizeLink(audioUri);
      const normalizedImageUri = normalizeLink(imageUri);

      const tx = await contract.addSong(normalizedAudioUri, normalizedImageUri, title);
      await tx.wait();

      alert("Audio submitted successfully!");
      fetchPlaylist();
      fetchUserSongs();
      setTitle("");
      setAudioUri("");
      setImageUri("");
      setDisclaimerChecked(false);
    } catch (error) {
      console.error("Error submitting audio:", error);
      setErrorMessage("Failed to submit audio to the smart contract.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Submit a New Audio</h2>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Audio Title:</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            aria-label="Audio Title"
          />
        </div>

        <div>
          <label htmlFor="audioUri">Audio File URL:</label>
          <input
            id="audioUri"
            type="url"
            value={audioUri}
            onChange={(e) => setAudioUri(e.target.value)}
            required
            placeholder="https://..."
            aria-label="Audio File URL"
          />
        </div>

        <div>
          <label htmlFor="imageUri">Cover Image URL:</label>
          <input
            id="imageUri"
            type="url"
            value={imageUri}
            onChange={(e) => setImageUri(e.target.value)}
            required
            placeholder="https://..."
            aria-label="Cover Image URL"
          />
        </div>

        <div>
          <label htmlFor="disclaimer">
            <input
              id="disclaimer"
              type="checkbox"
              checked={disclaimerChecked}
              onChange={(e) => setDisclaimerChecked(e.target.checked)}
            />{" "}
            I own the © of this audio and I have read the{" "}
            <a
              href="https://ipfs.io/ipfs/QmWTiPuw52UK2FQFDbnwABE8oJfnSps4VHCCzPkWXY8ZtF?filename=disclaimer.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              disclaimer
            </a>
          </label>
        </div>

        <div>
          <button type="submit" disabled={loading || !disclaimerChecked}>
            {loading ? "Submitting..." : "Submit Audio"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitSongForm;
