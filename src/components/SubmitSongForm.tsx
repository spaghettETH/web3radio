import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaMusic, FaFileAudio, FaImage } from 'react-icons/fa';
import { useWeb3Radio } from "../context/Web3RadioContext";

interface SubmitSongFormProps {
}

const SubmitSongForm : React.FC<SubmitSongFormProps> = () => {
  const [title, setTitle] = useState<string>("");
  const [audioUri, setAudioUri] = useState<string>("");
  const [imageUri, setImageUri] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [disclaimerChecked, setDisclaimerChecked] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const { playlistContract:contract, fetchPlaylist, fetchUserSongs } = useWeb3Radio();

  const normalizeLink = (url:string) => {
    if (url.includes("dropbox.com")) {
      const replacedUrl = url.replace("www.dropbox.com", "dl.dropboxusercontent.com");
      return replacedUrl;
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

  const handleSubmit = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title || !audioUri || !imageUri || !disclaimerChecked || !contract) {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const formVariants = {
    hidden: {
      height: 0,
      opacity: 0
    },
    visible: {
      height: "auto",
      opacity: 1,
      transition: {
        height: { duration: 0.4 },
        opacity: { duration: 0.3, delay: 0.2 }
      }
    }
  };

  return (
    <motion.div
      className="w-full bg-black text-white p-10 rounded-lg"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col lg:flex-row justify-between">
        <motion.div
          className="relative w-full lg:w-2/3"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h4 className="text-xl font-bold uppercase">Contribute</h4>
          <p className="text-5xl uppercase">
            Join the web3 music<br />revolution!
          </p>
          <motion.div
            style={{ height: "-webkit-fill-available" }}
            className="absolute bottom-0 right-0 lg:-right-10 w-full flex justify-end"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <img src="/fork.svg" alt="arrow" className="w-1/2 h-full object-contain" />
          </motion.div>
        </motion.div>

        <motion.div
          className="w-full lg:w-1/3 flex flex-row justify-center items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.button
            className="bg-cyan-500 rounded-lg px-4 py-2 uppercase font-bold text-black"
            onClick={() => setIsAccordionOpen((prev) => {
              if(!prev) {
                setErrorMessage(null);
              }
              return !prev;
            })}
            whileHover={{ backgroundColor: "#22d3ee" }}
            whileTap={{ scale: 0.95 }}
          >
            {isAccordionOpen ? "Close" : "Submit a New Song"}
          </motion.button>
        </motion.div>
      </div>

      {errorMessage && (
        <motion.p
          style={{ color: "red" }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          {errorMessage}
        </motion.p>
      )}

      <AnimatePresence>
        {isAccordionOpen && !errorMessage && (
          <motion.form
            onSubmit={handleSubmit}
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="mt-10"
          >
            <motion.div
              className="flex flex-col gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-full flex flex-col lg:flex-row gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-full"
                >
                  <label htmlFor="imageUri" className="flex items-center">
                    <FaImage className="mr-2" />
                    <p>COVER IMAGE</p>
                  </label>
                  <input
                    id="imageUri"
                    type="url"
                    value={imageUri}
                    onChange={(e) => setImageUri(e.target.value)}
                    required
                    placeholder="https://Link to cover image"
                    aria-label="Cover Image URL"
                    className="w-full border border-white rounded-md bg-black text-white p-2"
                  />
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-full"
                >
                  <label htmlFor="audioUri" className="flex items-center">
                    <FaMusic className="mr-2" />
                    <p>SONG UPLOAD</p>
                  </label>
                  <input
                    id="audioUri"
                    type="url"
                    value={audioUri}
                    onChange={(e) => setAudioUri(e.target.value)}
                    required
                    placeholder="https://Link to song"
                    aria-label="Audio File URL"
                    className="w-full border border-white rounded-md bg-black text-white p-2"
                  />
                </motion.div>
              </div>

              <div className="w-full flex flex-col lg:flex-row gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-full lg:w-2/3"
                >
                  <label htmlFor="title" className="flex items-center">
                    {/* <FaMusic className="mr-2" /> */}
                    <p>SONG TITLE</p>
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    aria-label="Audio Title"
                    className="w-full border border-white rounded-md bg-black text-white p-2"
                  />
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-full lg:w-1/3 flex items-end"
                >
                  <button
                    type="submit"
                    disabled={loading || !disclaimerChecked}
                    className="submit-button uppercase h-[42px] w-full"
                  >
                    {loading ? "Submitting..." : "Submit New Audio"}
                    &nbsp;→
                  </button>
                </motion.div>
              </div>

              <div className="lg:col-span-2">
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
            </motion.div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SubmitSongForm;
