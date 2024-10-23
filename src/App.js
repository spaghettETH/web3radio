import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import Playlist from './components/Playlist';
import AudioPlayer from './components/AudioPlayer';
import SubmitSongForm from './components/SubmitSongForm';
import RemoveOwnSong from './components/RemoveOwnSong'; // Import the RemoveOwnSong component


// Contract ABI and address
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
				"name": "index",
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
		"inputs": [],
		"name": "generatePlaylist",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "uris",
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
		"inputs": [],
		"name": "mySongs",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "myUris",
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
				"internalType": "string",
				"name": "uri",
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
		"name": "viewPlaylist",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "uris",
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
const contractAddress = "0x69A1129b3122f313027452779d6E1B90f62C552a";

const App = () => {
	const [provider, setProvider] = useState(null);
	const [contract, setContract] = useState(null);
	const [playlist, setPlaylist] = useState([]);
	const [mySongs, setMySongs] = useState([]);  // Track user's submitted songs
	const [isConnected, setIsConnected] = useState(false);
  
	useEffect(() => {
	  const initializeProvider = async () => {
		if (window.ethereum) {
		  const _provider = new BrowserProvider(window.ethereum);
		  await _provider.send('eth_requestAccounts', []);
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
		  const [uris, titles] = await contract.generatePlaylist();
		  const fetchedPlaylist = uris.map((uri, index) => ({
			uri,
			title: titles[index],
		  }));
		  setPlaylist(fetchedPlaylist);
		} catch (error) {
		  console.error("Error fetching playlist:", error);
		}
	  }
	};
  
	const fetchUserSongs = async () => {
	  if (contract) {
		try {
		  const [uris, titles] = await contract.mySongs();
		  const fetchedMySongs = uris.map((uri, index) => ({
			uri,
			title: titles[index],
		  }));
		  setMySongs(fetchedMySongs);
		} catch (error) {
		  console.error("Error fetching user's songs:", error);
		}
	  }
	};
  
	useEffect(() => {
	  if (contract) {
		fetchPlaylist();
		fetchUserSongs();  // Fetch user's songs on initial load
	  }
	}, [contract]);
  
	return (
	  <div>
		<h1>Web3 Playlist Player</h1>
		{isConnected ? (
		  <>
			<AudioPlayer playlist={playlist} />
			<Playlist playlist={playlist} />
			<SubmitSongForm contract={contract} fetchPlaylist={fetchPlaylist} fetchUserSongs={fetchUserSongs} />  {/* Pass fetchUserSongs */}
			<RemoveOwnSong contract={contract} mySongs={mySongs} fetchUserSongs={fetchUserSongs} />
			</>
		) : (
		  <p>Please connect to MetaMask.</p>
		)}
	  </div>
	);
  };
  
  export default App;