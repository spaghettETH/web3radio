import React, { useState, useEffect, useCallback } from "react";
import { BrowserProvider, Contract } from "ethers";
import Playlist from "./components/Playlist";
import Web3AudioPlayer from "./components/Web3AudioPlayer";
import SubmitSongForm from "./components/SubmitSongForm";
import RemoveOwnSong from "./components/RemoveOwnSong";
import MySaves from "./components/MySaves";
import SavesLeaderboard from "./components/SavesLeaderboard";
import Donate from "./components/Donate";
import ScheduleLive from "./components/ScheduleLive";
import Logo from "./components/Logo";
import Title from "./components/Title";
import RadioModality from "./components/RadioModality";
import { getSavedSongsStubs } from "./components/Stubber";
import { playlistABI, playlistAddress } from "./contracts/DecentralizePlaylist/contract";
import { scheduleLiveABI, scheduleLiveAddress } from "./contracts/ScheduleLive/contract";
import WalletButton from "./components/megoComponents/WalletButton";
import { useWeb3Context } from "./components/megoComponents/web3-context";
const App = () => {
	const [playlistContract, setPlaylistContract] = useState(null);
	const [scheduleLiveContract, setScheduleLiveContract] = useState(null);
	const [playlist, setPlaylist] = useState([]);
	const [mySongs, setMySongs] = useState([]);
	const [currentSong, setCurrentSong] = useState(null);
	const [isConnected, setIsConnected] = useState(false);
	const { loggedAs, provider: megoProvider, isLoading, openMegoModal, metamaskProvider:provider } = useWeb3Context();

	useEffect(() => {
		console.log("loggedAs", loggedAs);
		const isUserLogged = localStorage.getItem("loggedAs");
		if (!isUserLogged) {
			openMegoModal();
		}
	}, [loggedAs]);


	// Initialize Ethereum provider and contracts
	const initializeProvider = useCallback(async () => {
		if (loggedAs && provider) {
			try {
				const signer = await provider.getSigner();
				console.log("signer", signer);
				const _playlistContract = new Contract(playlistAddress, playlistABI, signer);
				const _scheduleLiveContract = new Contract(scheduleLiveAddress, scheduleLiveABI, signer);
				setPlaylistContract(_playlistContract);
				setScheduleLiveContract(_scheduleLiveContract);
				setIsConnected(true);
			} catch (error) {
				console.error("Error initializing provider:", error);
				alert("Failed to connect to MetaMask.");
			}
		}
	}, [loggedAs, provider]);

	// Fetch the playlist from the Playlist contract
	const fetchPlaylist = useCallback(async () => {
		if (playlistContract) {
			try {
				const playlistIds = await playlistContract.viewPlaylist();
				const playlistData = await Promise.all(
					playlistIds.map(async (id) => {
						const song = await playlistContract.getSongDetails(id);
						return song.isActive
							? { id: song.id.toString(), uri: song.uri, img: song.img, title: song.title, submitter: song.submitter }
							: null;
					})
				);
				setPlaylist(playlistData.filter((song) => song)); // Filter out inactive songs
			} catch (error) {
				console.error("Error fetching playlist:", error);
				setPlaylist([]);
			}
		}
	}, [playlistContract]);

	// Fetch user's submitted songs
	const fetchUserSongs = useCallback(async () => {
		const STUBBED = false;
		if (playlistContract && provider) {
			try {
				const signer = await provider.getSigner();
				const userAddress = await signer.getAddress();

				const userSongIds = await playlistContract.getUserSongs(userAddress);
				let userSongs = await Promise.all(
					userSongIds.map(async (id) => {
						const song = await playlistContract.getSongDetails(id);
						return song.isActive
							? {
								id: song.id.toString(),
								title: song.title || "(Untitled)",
								uri: song.uri,
								img: song.img
							}
							: null;
					})
				);

				if (STUBBED) {
					userSongs = await getSavedSongsStubs();
				} else {
					userSongs = await Promise.all(
						userSongIds.map(async (id) => {
							const song = await playlistContract.getSongDetails(id);
							return song.isActive
								? {
									id: song.id.toString(),
									title: song.title || "(Untitled)",
									uri: song.uri,
									img: song.img
								}
								: null;
						})
					);
				}

				setMySongs(userSongs.filter((song) => song)); // Exclude inactive songs
			} catch (error) {
				console.error("Error fetching user's songs:", error);
				setMySongs([]);
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
		<div className="flex gap-10 flex-col max-w-screen-lg items-center justify-center pt-10">
			<WalletButton />
			<Logo />
			<Title />

			{/* <h1>Decentralized Playlist Player</h1> */}
			{loggedAs ? (
				<>
					<Web3AudioPlayer
						playlist={playlist}
						setCurrentSong={(song) => {
							console.log("Setting current song:", song);
							setCurrentSong(song);
						}}
					/>
					<RadioModality onModalityChange={(modality) => {
						console.log("Modality changed:", modality);
					}} />
					{currentSong && currentSong.submitter ? (
						<Donate creatorAddress={currentSong.submitter} />
					) : (
						<p>No creator information available.</p>
					)}
					<Playlist playlist={playlist} />
					<RemoveOwnSong
						contract={playlistContract}
						mySongs={mySongs}
						fetchUserSongs={fetchUserSongs}
					/>
					<div className="w-full px-10">
						<SubmitSongForm
							contract={playlistContract}
							fetchPlaylist={fetchPlaylist}
							fetchUserSongs={fetchUserSongs}
						/>
					</div>
					<div className="w-full">
						<MySaves contract={playlistContract} currentSong={currentSong} />
						<SavesLeaderboard contract={playlistContract} />
					</div>
					<ScheduleLive contract={scheduleLiveContract} />
				</>
			) : (
				<p>Please connect to MetaMask.</p>
			)}
		</div>
	);
};

export default App;
