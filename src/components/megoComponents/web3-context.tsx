import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import MegoModal from "./MegoModal";
import "./mego-style.css";
import axios from "axios"; // Import axios for the createNewWallet function
import { BrowserProvider, ethers } from "ethers";
type Route =
  | "ChooseType"
  | "Email"
  | "Login"
  | "Register"
  | "Logged";
interface Web3ContextType {
  isMegoModalOpen: boolean; openMegoModal: () => void;
  redirectToGoogleLogin: () => void;
  redirectToAppleLogin: () => void;
  closeMegoModal: () => void;
  provider: string | null;
  walletConnectProvider: any;
  loginWithWalletConnect: () => Promise<void>;
  loggedAs: string | null;
  loadingText: string;
  setLoadingText: (text: string) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  section: Route;
  setSection: (section: Route) => void;
  prevSection: Route | undefined;
  setPrevSection: (section: Route | undefined) => void;
  logout: () => void;
  getProvider: () => any;
  getSigner: () => any;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

const BASE_URL = "https://wallet.mego.tools";

export const useWeb3Context = (): Web3ContextType => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error(
      "useWeb3Context deve essere usato all'interno di un Web3Provider"
    );
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [section, setSection] = useState<Route>("ChooseType");
  const [prevSection, setPrevSection] = useState<Route | undefined>();
  const [isMegoModalOpen, setIsMegoModalOpen] = useState<boolean>(false);
  const [provider, setProvider] = useState<string | null>(null);
  const [walletConnectProvider, setWalletConnectProvider] = useState<any>(null);
  const [noWalletConnectProvider, setNoWalletConnectProvider] = useState<any>(null);
  const [loggedAs, setLoggedAs] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>("");
  const openMegoModal = (): void => {
    setIsMegoModalOpen(true);
    setIsLoading(false); // Reset loading state when opening modal
  };

  useEffect(() => {
    try {
      if (loggedAs) {
        if (provider !== 'walletConnect') {
          console.log("Rilevato accesso tramite un provider != walletConnect");
          const jsonRpcProvider = new ethers.JsonRpcProvider(process.env.REACT_APP_JSON_RPC_PROVIDER);
          setNoWalletConnectProvider(jsonRpcProvider);
        }
      }
    } catch (error) {
      console.error("Error during loggedAs check", error);
      console.log(error);
    }
  }, [loggedAs])

  const closeMegoModal = (): void => {
    localStorage.setItem("isQuestionary", "false");
    setIsMegoModalOpen(false);
    setIsLoading(false); // Reset loading state when closing modal
  };

  function redirectToAppleLogin() {
    setIsLoading(true);
    localStorage.setItem("justLogged", "true");
    setTimeout(() => {
      window.location.href = BASE_URL + "/auth/apple" + "?origin="
        + window.location.href.replace("https://", "").replace("http://", "");
    }, 2500);
  }

  function redirectToGoogleLogin() {
    setIsLoading(true);
    localStorage.setItem("justLogged", "true");
    setTimeout(() => {
      window.location.href = BASE_URL + "/auth/google" + "?origin=" + window.location.href.replace("https://", "").replace("http://", "");
    }, 2500);

    console.log("redirectToGoogleLogin - ECCOCI QUI");
  }

  function redirectToQuestionary() {
    if (localStorage.getItem("isQuestionary") === "true") {
      openMegoModal();
    }
  }
  useEffect(() => {
    redirectToQuestionary();
  }, []);

  const logoutWalletConnect = async () => {

    try {
      // Rainbowkit walletconnect disconnect
      //@ts-ignore
      window.ethereum.removeAllListeners();
      //@ts-ignore
      setWalletConnectProvider(null);
      setProvider(null);
      setLoggedAs(null);
      localStorage.removeItem("provider");
      localStorage.removeItem("loggedAs");
    } catch (error) {
      console.error("Error logging out of walletconnect:", error);
    }
  }

  function logout() {
    setProvider(null);
    setLoggedAs(null);
    logoutWalletConnect();
    localStorage.removeItem("provider");
    localStorage.removeItem("loggedAs");
    console.log("[DEBUG]Effettuando il logout, loggedAs in localStorage:", localStorage.getItem("loggedAs"));
    window.history.replaceState(null, "", window.location.pathname);
  }


  //DEBUG
  useEffect(() => {
    console.log("[DEBUG]loggedAs ripristinato:", loggedAs);
    console.log("[DEBUG]provider ripristinato:", provider);
  }, [loggedAs, provider]);


  const getProvider = () => {
    if (provider === "walletConnect") {
      return walletConnectProvider;
    } else {
      return noWalletConnectProvider;
    }
  };

  const getSigner = async () => {
    if (provider === "walletConnect" && walletConnectProvider) {
      const signer = await walletConnectProvider.getSigner();
      return signer;
    } else {
      // Per Google e altri provider non-walletConnect, creiamo un signer personalizzato
      return {
        getAddress: async () => loggedAs,
        signMessage: async (message: string) => {
          //TODO: Mego backend sign message function
          throw new Error("Signing not supported for this provider");
        },
        sendTransaction: async (transaction: any) => {
          const provider = getProvider();
          return provider.sendTransaction(transaction);
        },
        connect: (provider: any) => {
          return provider;
        }
      };
    }
  };

  const loginWithWalletConnect = async () => {
    setLoadingText("Checking walletconnect ...");
    //@ts-ignore
    if (!window.ethereum) {
      alert("walletConnect is not installed");
      return;
    }
    try {
      //@ts-ignore
      const _provider = new BrowserProvider(window.ethereum);
      await _provider.send("eth_requestAccounts", []);
      const signer = await _provider.getSigner();
      const address = await signer.getAddress();
      setLoggedAs(address);
      localStorage.setItem("loggedAs", address);
      localStorage.setItem("provider", "walletConnect");
      setProvider("walletConnect");
      setWalletConnectProvider(_provider);

      //Switch chain to the one specified in the .env file
      if (process.env.REACT_APP_CHAIN_ID) {
        await _provider.send("wallet_switchEthereumChain", [{ chainId: `0x${parseInt(process.env.REACT_APP_CHAIN_ID).toString(16)}` }]); // Converti l'ID in esadecimale
      }
    } catch (error) {
      console.error("Error initializing provider:", error);
      console.log(error);
    } finally {
      setIsLoading(false);
      setLoadingText("");
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlProvider = searchParams.get("provider");
    const urlLoggedAs = searchParams.get("loggedAs");

    if (urlProvider) {
      setProvider(urlProvider);
      localStorage.setItem("provider", urlProvider);

      // Inizializza il provider JSON-RPC per Google
      if (urlProvider === 'google') {
        const jsonRpcProvider = new ethers.JsonRpcProvider(process.env.REACT_APP_JSON_RPC_PROVIDER);
        setNoWalletConnectProvider(jsonRpcProvider);
      }
    }

    if (urlLoggedAs) {
      setLoggedAs(urlLoggedAs);
      localStorage.setItem("loggedAs", urlLoggedAs);
    }

    if (!urlProvider && !urlLoggedAs) {
      const storedProvider = localStorage.getItem("provider");
      const storedLoggedAs = localStorage.getItem("loggedAs");
      console.log("[DEBUG]storedProvider:", storedProvider);
      console.log("[DEBUG]storedLoggedAs:", storedLoggedAs);
      if (storedProvider) {
        setProvider(storedProvider);
        // Inizializza il provider anche per sessioni ripristinate
        if (storedProvider === 'google') {
          const jsonRpcProvider = new ethers.JsonRpcProvider(process.env.REACT_APP_JSON_RPC_PROVIDER);
          setNoWalletConnectProvider(jsonRpcProvider);
        } else if (storedProvider === 'walletConnect') {
          loginWithWalletConnect();
        }
      }
      if (storedLoggedAs) setLoggedAs(storedLoggedAs);
    }

    if (urlProvider === 'google' && urlLoggedAs) {
      try {
        const jsonRpcProvider = new ethers.JsonRpcProvider("https://base-sepolia.g.alchemy.com/v2/KxxtZXKplWuSt71LXxy-9Mr4BhucrqEP");
        setNoWalletConnectProvider(jsonRpcProvider);
        setProvider('google');
        setLoggedAs(urlLoggedAs);
        localStorage.setItem("provider", 'google');
        localStorage.setItem("loggedAs", urlLoggedAs);
      } catch (error) {
        console.error("[Google Auth] Error initializing provider:", error);
      }
    }
  }, []);

  //Handle chain change
  useEffect(() => {
    const handleChainChanged = async (chainId: string) => {
      console.log("Chain cambiata:", chainId);
      const targetChainId = `0x${Number(process.env.REACT_APP_CHAIN_ID).toString(16)}`;
      // Verifica se la chain è diversa da quella target
      if (chainId !== targetChainId) {
        try {
          // Richiedi il cambio di rete
          //@ts-ignore
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetChainId }],
          });
        } catch (error) {
          console.error("Errore nel cambio rete:", error);
        }
      }
    };

    // Aggiungi il listener per il cambio chain
    //@ts-ignore
    window.ethereum?.on('chainChanged', handleChainChanged);

    // Cleanup del listener
    return () => {
      //@ts-ignore
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  
  //Usando windows.etherium verificiamo se l'address del wallet cambia (in caso di cambiamento refresh)
  useEffect(() => {
    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length > 0) {
        //refresh the page
        window.location.reload();
      }
    };
    //@ts-ignore
    window?.ethereum?.on('accountsChanged', handleAccountsChanged);
    return () => {
      //@ts-ignore
      window?.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);


  const value: Web3ContextType = {
    getProvider, getSigner, isMegoModalOpen, openMegoModal,
    redirectToAppleLogin, redirectToGoogleLogin, closeMegoModal, provider, walletConnectProvider, loginWithWalletConnect, section,
    setSection, prevSection, setPrevSection, loggedAs, isLoading, logout, setIsLoading, loadingText, setLoadingText,
  };
  return (
    <Web3Context.Provider value={value}>
      {children}
      <MegoModal isOpen={isMegoModalOpen} onClose={closeMegoModal} />
    </Web3Context.Provider>
  );
};
export type { Route };