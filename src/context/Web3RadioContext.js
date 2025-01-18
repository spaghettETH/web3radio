import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useWeb3Context } from "../components/megoComponents/web3-context";
import { Contract } from "ethers";
import { playlistABI, playlistAddress } from "../contracts/DecentralizePlaylist/contract";
import { scheduleLiveABI, scheduleLiveAddress } from "../contracts/ScheduleLive/contract";

export const Web3RadioContext = createContext();

export const Web3RadioProvider = ({ children }) => {
    const [playlist, setPlaylist] = useState([]);
    const {loggedAs, getProvider, isLoading, openMegoModal } = useWeb3Context();

    //Contracts
    const [playlistContract, setPlaylistContract] = useState(null);
    const [scheduleLiveContract, setScheduleLiveContract] = useState(null);
    const [mySongs, setMySongs] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
		const isUserLogged = localStorage.getItem("loggedAs");
		if (!isUserLogged) {
			openMegoModal();
		}
	}, [loggedAs]);

    const initializeProvider = useCallback(async () => {
		const provider = getProvider();
		console.log("provider", provider);
		if (loggedAs && provider) {
			try {
				console.log("Ci stiamo loggando con provider", provider);
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
	}, [loggedAs, getProvider]);


    const fetchPlaylist = useCallback(async () => {
        const provider = getProvider();
        if (playlistContract && provider) {
            try {
                const playlistIds = await playlistContract.viewPlaylist();
                const playlistData = await Promise.all(
                    playlistIds.map(async (id) => {
                        const song = await playlistContract.getSongDetails(id);
                        return song.isActive
                            ? {
                                id: song.id.toString(),
                                uri: song.uri,
                                img: song.img,
                                title: song.title,
                                submitter: song.submitter
                            }
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
        const provider = getProvider();
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
                setMySongs(userSongs.filter((song) => song)); // Exclude inactive songs
            } catch (error) {
                console.error("Error fetching user's songs:", error);
                setMySongs([]);
            }
        }
    }, [playlistContract, getProvider]);

    // Initialize provider on component mount
	useEffect(() => {
		initializeProvider();
	}, [initializeProvider]);

    useEffect(() => {
		if (playlistContract) {
			fetchPlaylist();
			fetchUserSongs();
		}
	}, [playlistContract, fetchPlaylist, fetchUserSongs]);

    return <Web3RadioContext.Provider
        value={{ 
            playlistContract, 
            playlist, 
            fetchPlaylist, 
            fetchUserSongs,
            scheduleLiveContract,
            mySongs,
            isConnected,
        }}>
        {children}
    </Web3RadioContext.Provider>;
};

export const useWeb3Radio = () => {
    const context = useContext(Web3RadioContext);
    if (!context) {
        throw new Error('useWeb3Radio deve essere usato all\'interno di un Web3RadioProvider');
    }
    return context;
};

export default Web3RadioProvider;
