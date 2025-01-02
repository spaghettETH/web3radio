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
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "addToWhitelist",
		"outputs": [],
		"stateMutability": "nonpayable",
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
		"name": "removeFromWhitelist",
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
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
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
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
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

const contractAddress = "0xb366e75d47b1ef16629a225b35C58C22aD0be320";

const App = () => {
	const [provider, setProvider] = useState(null);
	const [contract, setContract] = useState(null);
	const [playlist, setPlaylist] = useState([]);
	const [mySongs, setMySongs] = useState([]);
	const [currentSong, setCurrentSong] = useState(null); // Tracks the current audio
	const [isConnected, setIsConnected] = useState(false);
  
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
  
	const fetchPlaylist = useCallback(async () => {
		if (contract) {
		  try {
			const [uris, imgs, titles, submitters] = await contract.viewPlaylist();
			const combinedPlaylist = uris.map((uri, index) => ({
			  id: index,
			  uri,
			  img: imgs[index],
			  title: titles[index],
			  submitter: submitters[index],
			}));
			const shuffledPlaylist = combinedPlaylist.sort(() => Math.random() - 0.5);
			setPlaylist(shuffledPlaylist);
		  } catch (error) {
			console.error("Error fetching playlist:", error);
		  }
		}
	  }, [contract]);
	  
  
	const fetchUserSongs = useCallback(async () => {
	  if (contract && provider) {
		try {
		  const signer = await provider.getSigner();
		  const userAddress = await signer.getAddress();
		  const userSongIds = await contract.getUserSongs(userAddress);
		  const userSongs = await Promise.all(
			userSongIds.map(async (id) => {
			  const song = await contract.playlist(id);
			  return {
				id: song.id.toString(),
				title: song.title,
				uri: song.uri,
			  };
			})
		  );
		  setMySongs(userSongs);
		} catch (error) {
		  console.error("Error fetching user's songs:", error);
		}
	  }
	}, [contract, provider]);
  
	useEffect(() => {
	  initializeProvider();
	}, [initializeProvider]);
  
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
			  <AudioPlayer 
				playlist={playlist} 
				setCurrentSong={(song) => {
				  console.log("Setting current song:", song); // Debugging
				  setCurrentSong(song);
				}} 
			  />
			  {currentSong && currentSong.submitter ? (
				<>
					{console.log("Rendering Donate with:", currentSong.submitter)} {/* Debug */}
					<Donate creatorAddress={currentSong.submitter} />
				</>
				) : (
				<>
					{console.log("No creator information available for:", currentSong)} {/* Debug */}
					<p>No creator information available.</p>
				</>
				)}

			  <Playlist playlist={playlist} />
			  <SubmitSongForm
				contract={contract}
				fetchPlaylist={fetchPlaylist}
				fetchUserSongs={fetchUserSongs}
			  />
			  <RemoveOwnSong
				contract={contract}
				mySongs={mySongs}
				fetchUserSongs={fetchUserSongs}
			  />
			  <MySaves contract={contract} currentSong={currentSong} />
			  <SavesLeaderboard contract={contract} />
			</>
		  ) : (
			<p>Please connect to MetaMask.</p>
		  )}
		</div>
	  );	  
  };
  
  export default App;