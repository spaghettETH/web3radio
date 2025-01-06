import React, { useState, useEffect, useCallback } from "react";
import { BrowserProvider, Contract } from "ethers";
import Playlist from "./components/Playlist";
import AudioPlayer from "./components/AudioPlayer";
import SubmitSongForm from "./components/SubmitSongForm";
import RemoveOwnSong from "./components/RemoveOwnSong";
import MySaves from "./components/MySaves";
import SavesLeaderboard from "./components/SavesLeaderboard";
import Donate from "./components/Donate";


const contractABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "uri",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "img",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "title",
				"type": "string"
			}
		],
		"name": "addSong",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "addToMySaves",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "songId",
				"type": "uint256"
			}
		],
		"name": "removeAnySong",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "songId",
				"type": "uint256"
			}
		],
		"name": "removeOwnSong",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_nftContract",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getPlaylistLength",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getUserSongs",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "mostSaved",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "uri",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "img",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "title",
						"type": "string"
					},
					{
						"internalType": "address",
						"name": "submitter",
						"type": "address"
					},
					{
						"internalType": "bool",
						"name": "isActive",
						"type": "bool"
					}
				],
				"internalType": "struct DecentraPlaylist.Song[]",
				"name": "",
				"type": "tuple[]"
			},
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "nextSongId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "nftContract",
		"outputs": [
			{
				"internalType": "contract IERC721",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "playlist",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "uri",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "img",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "submitter",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "retrieveMySaves",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "uri",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "img",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "title",
						"type": "string"
					},
					{
						"internalType": "address",
						"name": "submitter",
						"type": "address"
					},
					{
						"internalType": "bool",
						"name": "isActive",
						"type": "bool"
					}
				],
				"internalType": "struct DecentraPlaylist.Song[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "songsById",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "uri",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "img",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "submitter",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "songScores",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "userSaves",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "userSongs",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "viewPlaylist",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "uris",
				"type": "string[]"
			},
			{
				"internalType": "string[]",
				"name": "imgs",
				"type": "string[]"
			},
			{
				"internalType": "string[]",
				"name": "titles",
				"type": "string[]"
			},
			{
				"internalType": "address[]",
				"name": "submitters",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "whitelist",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const contractAddress = "0x7646C3609E473C4f1E46E61AC68c3D5389cA356A";

const App = () => {
	const [provider, setProvider] = useState(null);
	const [contract, setContract] = useState(null);
	const [playlist, setPlaylist] = useState([]);
	const [mySongs, setMySongs] = useState([]);
	const [currentSong, setCurrentSong] = useState(null); // Tracks the current audio
	const [isConnected, setIsConnected] = useState(false);
  
	// Initialize Ethereum provider and contract
	const initializeProvider = useCallback(async () => {
	  if (window.ethereum) {
		try {
		  const _provider = new BrowserProvider(window.ethereum);
		  await _provider.send("eth_requestAccounts", []);
		  const signer = await _provider.getSigner();
		  const _contract = new Contract(contractAddress, contractABI, signer);
		  setProvider(_provider);
		  setContract(_contract);
		  setIsConnected(true);
		} catch (error) {
		  console.error("Error initializing provider:", error);
		  alert("Failed to connect to MetaMask.");
		}
	  } else {
		alert("Please install MetaMask!");
	  }
	}, []);
  
	// Fetch the playlist from the contract
	const fetchPlaylist = useCallback(async () => {
		if (contract) {
		  try {
			const [uris, imgs, titles, submitters] = await contract.viewPlaylist();
			console.log("Fetched playlist data:", { uris, imgs, titles, submitters }); // Debugging

			if (uris.length === 0) {
			  console.warn("No songs in the playlist.");
			  setPlaylist([]);
			  return;
			}
			const combinedPlaylist = uris.map((uri, index) => ({
			  id: index.toString(),
			  uri,
			  img: imgs[index],
			  title: titles[index],
			  submitter: submitters[index],
			}));
			console.log("Fetched and Shuffled Playlist:", combinedPlaylist);
			setPlaylist(combinedPlaylist.sort(() => Math.random() - 0.5)); // Shuffle playlist
		  } catch (error) {
			console.error("Error fetching playlist:", error);
			setPlaylist([]); // Reset state on error
		  }
		}
	  }, [contract]);
	  
  
	// Fetch user's submitted songs
	const fetchUserSongs = useCallback(async () => {
		if (contract && provider) {
		  try {
			const signer = await provider.getSigner();
			const userAddress = await signer.getAddress();
			console.log("User Address:", userAddress); // Debugging
	  
			// Fetch user's song IDs
			const userSongIds = await contract.getUserSongs(userAddress);
			console.log("Fetched User Song IDs:", userSongIds); // Debugging
	  
			// Fetch song details for each ID
			const userSongs = await Promise.all(
			  userSongIds.map(async (id) => {
				try {
				  const song = await contract.songsById(id);
				  console.log(`Fetched Song for ID ${id}:`, song); // Debugging
	  
				  // Only include active songs
				  return song.isActive
					? {
						id: song.id.toString(),
						title: song.title || "(Untitled)",
						uri: song.uri,
						img: song.img,
					  }
					: null;
				} catch (error) {
				  console.error(`Error fetching song with ID ${id}:`, error); // Debugging
				  return null;
				}
			  })
			);
	  
			const validSongs = userSongs.filter((song) => song); // Exclude inactive songs
			console.log("Valid Songs After Filtering:", validSongs); // Debugging
			setMySongs(validSongs);
		  } catch (error) {
			console.error("Error fetching user's songs:", error);
			setMySongs([]); // Reset state on error
		  }
		}
	  }, [contract, provider]);
	  
	  
  
	// Initialize provider on component mount
	useEffect(() => {
	  initializeProvider();
	}, [initializeProvider]);
  
	// Fetch playlist and user songs when the contract is ready
	useEffect(() => {
	  if (contract) {
		fetchPlaylist();
		fetchUserSongs();
	  }
	}, [contract, fetchPlaylist, fetchUserSongs]);
  
	return (
		<div>
		  <h1>Decentralized Playlist Player</h1>
		  {isConnected ? (
			<>
			  {/* Audio Player */}
			  {playlist.length > 0 ? (
				<AudioPlayer
				  playlist={playlist}
				  setCurrentSong={(song) => {
					console.log("Setting current song:", song); // Debug
					setCurrentSong(song);
				  }}
				/>
			  ) : (
				<p>No songs available in the playlist.</p>
			  )}
	  
			  {/* Donate Section */}
			  {currentSong && currentSong.submitter ? (
				<Donate creatorAddress={currentSong.submitter} />
			  ) : (
				<p>No creator information available.</p>
			  )}
	  
			  {/* Playlist Component */}
			  {playlist.length > 0 ? (
				<Playlist playlist={playlist} />
			  ) : (
				<p>No playlist available to display.</p>
			  )}
	  
			  {/* Submit Song Form */}
			  <SubmitSongForm
				contract={contract}
				fetchPlaylist={fetchPlaylist}
				fetchUserSongs={fetchUserSongs}
			  />
	  
			  {/* Remove Own Song */}
			  {mySongs.length > 0 ? (
				<RemoveOwnSong
				  contract={contract}
				  mySongs={mySongs}
				  fetchUserSongs={fetchUserSongs}
				/>
			  ) : (
				<p>You have not submitted any audios yet.</p>
			  )}
	  
			  {/* My Saves */}
			  <MySaves contract={contract} currentSong={currentSong} />
	  
			  {/* Saves Leaderboard */}
			  <SavesLeaderboard contract={contract} />
			</>
		  ) : (
			<p>Please connect to MetaMask.</p>
		  )}
		</div>
	  );
	  
  };
  
  export default App;