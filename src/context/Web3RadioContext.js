import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useWeb3Context } from "../components/megoComponents/web3-context";
import { Contract } from "ethers";
import { playlistABI, playlistAddress } from "../contracts/DecentralizePlaylist/contract";
import { scheduleLiveABI, scheduleLiveAddress } from "../contracts/ScheduleLive/contract";

export const Web3RadioContext = createContext();

export const Web3RadioProvider = ({ children }) => {
    const [playlist, setPlaylist] = useState([]);
    const {loggedAs, getProvider, isLoading, openMegoModal, getSigner } = useWeb3Context();

    //Contracts
    const [playlistContract, setPlaylistContract] = useState(null);
    const [scheduleLiveContract, setScheduleLiveContract] = useState(null);
    const [mySongs, setMySongs] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    const [radioModality, setRadioModality] = useState("live");

    useEffect(() => {
		const isUserLogged = localStorage.getItem("loggedAs");
		if (!isUserLogged) {
            setIsConnected(false);
			openMegoModal();
		}
	}, [loggedAs]);

    const initializeProvider = useCallback(async () => {
        if (loggedAs) {
            try {
                console.log("[initializeProvider] LoggedAs:", loggedAs);
                
                // Otteniamo il signer
                const signer = await getSigner();
                console.log("[initializeProvider] Signer:", signer);
                
                // Creiamo i contratti direttamente con il signer
                const _playlistContract = new Contract(playlistAddress, playlistABI, signer);
                const _scheduleLiveContract = new Contract(scheduleLiveAddress, scheduleLiveABI, signer);
                
                setPlaylistContract(_playlistContract);
                setScheduleLiveContract(_scheduleLiveContract);
                setIsConnected(true);

                console.log("[initializeProvider] Contracts initialized with signer");
            } catch (error) {
                console.error("[initializeProvider] Error:", error);
                setIsConnected(false);
            }
        }
    }, [loggedAs, getSigner]);

    // Aggiungiamo un effetto per reinizializzare i contratti quando cambia il provider
    useEffect(() => {
        if (loggedAs) {
            initializeProvider();
        }
    }, [loggedAs, initializeProvider]);

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
                const userAddress = loggedAs;
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

    useEffect(() => {
		if (playlistContract) {
			fetchPlaylist();
			fetchUserSongs();
            //TODO: La scelta della modalità deve essere fatta qui
            setRadioModality("playlist");
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
            radioModality,
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
