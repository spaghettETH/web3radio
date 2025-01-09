import React, { useState, useEffect, useCallback } from "react";
import { BrowserProvider, Contract } from "ethers";
import Playlist from "./components/Playlist";
import AudioPlayer from "./components/AudioPlayer";
import SubmitSongForm from "./components/SubmitSongForm";
import RemoveOwnSong from "./components/RemoveOwnSong";
import MySaves from "./components/MySaves";
import SavesLeaderboard from "./components/SavesLeaderboard";
import Donate from "./components/Donate";
import ScheduleLive from "./components/ScheduleLive"; // Import the new component

// Playlist contract details
const playlistABI = [
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
const playlistAddress = "0x7646C3609E473C4f1E46E61AC68c3D5389cA356A";

// ScheduleLive contract details
const scheduleLiveABI = [
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
				"name": "",
				"type": "uint256"
			}
		],
		"name": "events",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "imageUrl",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "livestreamUrl",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "startTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "duration",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "creator",
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
		"name": "eventsById",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "imageUrl",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "livestreamUrl",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "startTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "duration",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "creator",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAllEventsSimplified",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "ids",
				"type": "uint256[]"
			},
			{
				"internalType": "string[]",
				"name": "titles",
				"type": "string[]"
			},
			{
				"internalType": "string[]",
				"name": "imageUrls",
				"type": "string[]"
			},
			{
				"internalType": "string[]",
				"name": "livestreamUrls",
				"type": "string[]"
			},
			{
				"internalType": "uint256[]",
				"name": "startTimes",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256[]",
				"name": "durations",
				"type": "uint256[]"
			},
			{
				"internalType": "address[]",
				"name": "creators",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getMyBookedShows",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "ids",
				"type": "uint256[]"
			},
			{
				"internalType": "string[]",
				"name": "titles",
				"type": "string[]"
			},
			{
				"internalType": "string[]",
				"name": "imageUrls",
				"type": "string[]"
			},
			{
				"internalType": "string[]",
				"name": "livestreamUrls",
				"type": "string[]"
			},
			{
				"internalType": "uint256[]",
				"name": "startTimes",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256[]",
				"name": "durations",
				"type": "uint256[]"
			},
			{
				"internalType": "address[]",
				"name": "creators",
				"type": "address[]"
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
		"name": "isSlotTaken",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "nextEventId",
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
		"name": "onAirNow",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			},
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "title",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "imageUrl",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "livestreamUrl",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "startTime",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "duration",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "creator",
						"type": "address"
					}
				],
				"internalType": "struct DecentraLiveSchedule.LiveEvent",
				"name": "",
				"type": "tuple"
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
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "imageUrl",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "livestreamUrl",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "startTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "duration",
				"type": "uint256"
			}
		],
		"name": "scheduleEvent",
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
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "userEvents",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
const scheduleLiveAddress = "0x253Efd602e95D60991cd8fff757341A905Fdb716";

const App = () => {
  const [provider, setProvider] = useState(null);
  const [playlistContract, setPlaylistContract] = useState(null);
  const [scheduleLiveContract, setScheduleLiveContract] = useState(null); // New state
  const [playlist, setPlaylist] = useState([]);
  const [mySongs, setMySongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null); // Tracks the current audio
  const [isConnected, setIsConnected] = useState(false);

  // Initialize Ethereum provider and contracts
  const initializeProvider = useCallback(async () => {
    if (window.ethereum) {
      try {
        const _provider = new BrowserProvider(window.ethereum);
        await _provider.send("eth_requestAccounts", []);
        const signer = await _provider.getSigner();

        // Initialize contracts
        const _playlistContract = new Contract(playlistAddress, playlistABI, signer);
        const _scheduleLiveContract = new Contract(scheduleLiveAddress, scheduleLiveABI, signer);

        setProvider(_provider);
        setPlaylistContract(_playlistContract);
        setScheduleLiveContract(_scheduleLiveContract); // Set the new contract
        setIsConnected(true);
      } catch (error) {
        console.error("Error initializing provider:", error);
        alert("Failed to connect to MetaMask.");
      }
    } else {
      alert("Please install MetaMask!");
    }
  }, []);

  // Fetch the playlist from the Playlist contract
  const fetchPlaylist = useCallback(async () => {
    if (playlistContract) {
      try {
        const [uris, imgs, titles, submitters] = await playlistContract.viewPlaylist();
        console.log("Fetched playlist data:", { uris, imgs, titles, submitters }); // Debugging

        const combinedPlaylist = uris.map((uri, index) => ({
          id: index.toString(),
          uri,
          img: imgs[index],
          title: titles[index],
          submitter: submitters[index],
        }));
        setPlaylist(combinedPlaylist.sort(() => Math.random() - 0.5)); // Shuffle playlist
      } catch (error) {
        console.error("Error fetching playlist:", error);
        setPlaylist([]); // Reset state on error
      }
    }
  }, [playlistContract]);

  // Fetch user's submitted songs
  const fetchUserSongs = useCallback(async () => {
    if (playlistContract && provider) {
      try {
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();

        const userSongIds = await playlistContract.getUserSongs(userAddress);
        const userSongs = await Promise.all(
          userSongIds.map(async (id) => {
            const song = await playlistContract.songsById(id);
            return song.isActive
              ? { id: song.id.toString(), title: song.title || "(Untitled)", uri: song.uri, img: song.img }
              : null;
          })
        );

        setMySongs(userSongs.filter((song) => song)); // Exclude inactive songs
      } catch (error) {
        console.error("Error fetching user's songs:", error);
        setMySongs([]); // Reset state on error
      }
    }
  }, [playlistContract, provider]);

  // Initialize provider on component mount
  useEffect(() => {
    initializeProvider();
  }, [initializeProvider]);

  // Fetch playlist and user songs when the Playlist contract is ready
  useEffect(() => {
    if (playlistContract) {
      fetchPlaylist();
      fetchUserSongs();
    }
  }, [playlistContract, fetchPlaylist, fetchUserSongs]);

  return (
    <div>
      <h1>Decentralized Playlist Player</h1>
      {isConnected ? (
        <>
          <AudioPlayer
            playlist={playlist}
            setCurrentSong={(song) => {
              console.log("Setting current song:", song); // Debug
              setCurrentSong(song);
            }}
          />
          {currentSong && currentSong.submitter ? (
            <Donate creatorAddress={currentSong.submitter} />
          ) : (
            <p>No creator information available.</p>
          )}
          <Playlist playlist={playlist} />
          <SubmitSongForm
            contract={playlistContract}
            fetchPlaylist={fetchPlaylist}
            fetchUserSongs={fetchUserSongs}
          />
          <RemoveOwnSong
            contract={playlistContract}
            mySongs={mySongs}
            fetchUserSongs={fetchUserSongs}
          />
          <MySaves contract={playlistContract} currentSong={currentSong} />
          <SavesLeaderboard contract={playlistContract} />
          <ScheduleLive contract={scheduleLiveContract} /> {/* Integrate new component */}
        </>
      ) : (
        <p>Please connect to MetaMask.</p>
      )}
    </div>
  );
};

export default App;
