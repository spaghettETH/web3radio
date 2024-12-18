import React, { useState, useEffect } from "react";
import { BrowserProvider, Contract } from "ethers";
import Playlist from "./components/Playlist";
import AudioPlayer from "./components/AudioPlayer";
import SubmitSongForm from "./components/SubmitSongForm";
import RemoveOwnSong from "./components/RemoveOwnSong";
import MySaves from "./components/MySaves";
import SavesLeaderboard from "./components/SavesLeaderboard";

// Contract ABI and address
const contractABI = [
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
const contractAddress = "0x1b79a251DfD2ec21eBAaA82b75c0B93a7D801677";

const App = () => {
	const [provider, setProvider] = useState(null);
	const [contract, setContract] = useState(null);
	const [playlist, setPlaylist] = useState([]);
	const [mySongs, setMySongs] = useState([]);
	const [currentSong, setCurrentSong] = useState(null); // Tracks the current audio
	const [isConnected, setIsConnected] = useState(false);
  
	useEffect(() => {
	  const initializeProvider = async () => {
		if (window.ethereum) {
		  const _provider = new BrowserProvider(window.ethereum);
		  await _provider.send("eth_requestAccounts", []);
		  const signer = await _provider.getSigner();
		  const _contract = new Contract(contractAddress, contractABI, signer);
		  setProvider(_provider);
		  setContract(_contract);
		  setIsConnected(true);
		} else {
		  alert("Please install MetaMask!");
		}
	  };
  
	  initializeProvider();
	}, []);
  
	const fetchPlaylist = async () => {
	  if (contract) {
		try {
		  const [uris, imgs, titles] = await contract.viewPlaylist();
		  const combinedPlaylist = uris.map((uri, index) => ({
			id: index,
			uri,
			img: imgs[index],
			title: titles[index],
		  }));
		  const shuffledPlaylist = combinedPlaylist.sort(() => Math.random() - 0.5);
		  setPlaylist(shuffledPlaylist);
		} catch (error) {
		  console.error("Error fetching playlist:", error);
		}
	  }
	};
  
	const fetchUserSongs = async () => {
	  if (contract) {
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
	};
  
	useEffect(() => {
	  if (contract) {
		fetchPlaylist();
		fetchUserSongs();
	  }
	}, [contract]);
  
	return (
	  <div>
		<h1>Decentralized Playlist Player</h1>
		{isConnected ? (
		  <>
			<AudioPlayer playlist={playlist} setCurrentSong={setCurrentSong} />
			<Playlist playlist={playlist} />
			<SubmitSongForm contract={contract} fetchPlaylist={fetchPlaylist} fetchUserSongs={fetchUserSongs} />
			<RemoveOwnSong contract={contract} mySongs={mySongs} fetchUserSongs={fetchUserSongs} />
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
  