import React, { useState } from "react";

const SubmitSongForm = ({ contract, fetchPlaylist, fetchUserSongs }) => {
  const [title, setTitle] = useState("");
  const [audioUri, setAudioUri] = useState("");
  const [imageUri, setImageUri] = useState("");
  const [loading, setLoading] = useState(false);
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);

  // Normalize external links (Dropbox and Google Drive)
  const normalizeLink = (url) => {
    if (url.includes("dropbox.com")) {
      return url.replace("dl=0", "raw=1"); // Convert Dropbox share link to direct link
    }
    if (url.includes("drive.google.com")) {
      const match = url.match(/\/file\/d\/([^/]+)\//); // Extract file ID
      if (match && match[1]) {
        return `https://drive.google.com/uc?id=${match[1]}&export=download`; // Direct download link
      }
      const altMatch = url.match(/id=([^&]+)/); // Handle alternative formats
      if (altMatch && altMatch[1]) {
        return `https://drive.google.com/uc?id=${altMatch[1]}&export=download`;
      }
    }
    return url; // Return unchanged if not Dropbox or Google Drive
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !audioUri || !imageUri || !disclaimerChecked) {
      alert("Please provide a title, audio URL, image URL, and check the disclaimer box.");
      return;
    }

    setLoading(true);

    try {
      // Normalize provided URLs
      const normalizedAudioUri = normalizeLink(audioUri);
      const normalizedImageUri = normalizeLink(imageUri);

      // Submit song to the smart contract
      const tx = await contract.addSong(normalizedAudioUri, normalizedImageUri, title);
      await tx.wait();

      alert("Audio submitted successfully!");
      fetchPlaylist();
      fetchUserSongs();
    } catch (error) {
      console.error("Error submitting audio:", error);
      alert("Failed to submit audio to the smart contract.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Submit a New Audio</h2>
      <form onSubmit={handleSubmit}>
        {/* Title Input */}
        <div>
          <label htmlFor="title">Audio Title:</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Audio URI Input */}
        <div>
          <label htmlFor="audioUri">Audio File URL (e.g., IPFS, Dropbox, or Google Drive):</label>
          <input
            id="audioUri"
            type="url"
            value={audioUri}
            onChange={(e) => setAudioUri(e.target.value)}
            required
            placeholder="https://..."
          />
        </div>

        {/* Image URI Input */}
        <div>
          <label htmlFor="imageUri">Cover Image URL (e.g., IPFS, Dropbox, or Google Drive):</label>
          <input
            id="imageUri"
            type="url"
            value={imageUri}
            onChange={(e) => setImageUri(e.target.value)}
            required
            placeholder="https://..."
          />
        </div>

        {/* Disclaimer Checkbox */}
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

        {/* Submit Button */}
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
