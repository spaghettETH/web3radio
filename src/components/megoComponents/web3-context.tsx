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
  isMegoModalOpen: boolean;
  openMegoModal: () => void;
  redirectToGoogleLogin: () => void;
  redirectToAppleLogin: () => void;
  closeMegoModal: () => void;
  provider: string | null;
  metamaskProvider: any;
  loginWithMetamask: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
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
  createNewWallet: (email: string, password: string) => Promise<void>; // Add the createNewWallet function to the context
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
  const [metamaskProvider, setMetamaskProvider] = useState<any>(null);
  const [noMetamaskProvider, setNoMetamaskProvider] = useState<any>(null);
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
        if (provider !== 'metamask') {
          console.log("Rilevato accesso tramite un provider != metamask");
          const jsonRpcProvider = new ethers.JsonRpcProvider("https://base-sepolia.g.alchemy.com/v2/KxxtZXKplWuSt71LXxy-9Mr4BhucrqEP");
          setNoMetamaskProvider(jsonRpcProvider);
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
      window.location.href =
        BASE_URL +
        "/auth/apple" +
        "?origin=" +
        window.location.href.replace("https://", "").replace("http://", "");
    }, 2500);
  }

  function redirectToGoogleLogin() {
    setIsLoading(true);
    localStorage.setItem("justLogged", "true");
    setTimeout(() => {
      window.location.href =
        BASE_URL +
        "/auth/google" +
        "?origin=" +
        window.location.href.replace("https://", "").replace("http://", "");
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

  function logout() {
    setProvider(null);
    setLoggedAs(null);
    logoutMetamask();
    localStorage.removeItem("provider");
    localStorage.removeItem("loggedAs");
    //window.location.href = "/";
  }

  const loginWithEmail = async (email: string, password: string) => {
    console.log("loginWithEmail - ECCOCI QUI");
    const lowerCaseEmail = email.toLowerCase();
    setLoadingText("Checking email and password");
    const check = await axios.post(`${BASE_URL}/wallets/check`, {
      email: lowerCaseEmail,
      password: password,
    });
    if (check.data.error === false) {
      setIsLoading(false);
      setLoadingText("");
      // Logica per gestire il login
      const address = check.data.addresses.eth;
      setLoggedAs(address);
      localStorage.setItem("loggedAs", check.data.addresses.eth);
      localStorage.setItem("provider", "email");
      localStorage.setItem("email", email);
      setProvider("email");

      //Creare provider 
      const jsonRpcProvider = new ethers.JsonRpcProvider("https://sepolia.drpc.org");
      console.log("jsonRpcProvider", jsonRpcProvider);
      setNoMetamaskProvider(jsonRpcProvider); // Imposta il provider
    } else {
      setLoadingText("");
      alert(check.data.message);
      setIsLoading(false);
    }
  };

  const getProvider = () => {
    if (provider === "metamask") {
      return metamaskProvider;
    } else {
      return noMetamaskProvider;
    }
  };

  const getSigner = async () => {
    if (provider === "metamask" && metamaskProvider) {
      const signer = await metamaskProvider.getSigner();
      return signer;
    } else {
      // Per Google e altri provider non-Metamask, creiamo un signer personalizzato
      return {
        getAddress: async () => loggedAs,
        signMessage: async (message: string) => {
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

  const loginWithMetamask = async () => {
    setLoadingText("Checking metamask ...");
    //@ts-ignore
    if (!window.ethereum) {
      alert("Metamask is not installed");
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
      localStorage.setItem("provider", "metamask");
      setProvider("metamask");
      setMetamaskProvider(_provider);

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

  const logoutMetamask = () => {

    try {
      //@ts-ignore
      window.ethereum.removeAllListeners();
      //@ts-ignore
      setMetamaskProvider(null);
      setProvider(null);
      setLoggedAs(null);
      localStorage.removeItem("provider");
      localStorage.removeItem("loggedAs");
    } catch (error) {
      console.error("Error logging out of metamask:", error);
    }
  }
  // Aggiungi la funzione per creare un nuovo wallet
  async function createNewWallet(email: string, password: string) {
    if (!isLoading) {
      setIsLoading(true);
      setLoadingText("Creating new mego wallet");
      const lowerCaseEmail = email.toLowerCase();
      const create = await axios.post(`${BASE_URL}/wallets/email/new`, {
        email: lowerCaseEmail,
        password: password,
      });

      if (!create.data.error) {
        await loginWithEmail(email, password);
      } else {
        alert(create.data.message);
        setIsLoading(false);
        setLoadingText("");
      }
    }
  }

  //Handle refresh page
  useEffect(() => {
    const megoProvider = localStorage.getItem("provider");
    if (megoProvider === 'metamask') {
      loginWithMetamask();
    }
  }, [])

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
        setNoMetamaskProvider(jsonRpcProvider);
      }
    }
    
    if (urlLoggedAs) {
      setLoggedAs(urlLoggedAs);
      localStorage.setItem("loggedAs", urlLoggedAs);
    }

    if (!urlProvider && !urlLoggedAs) {
      const storedProvider = localStorage.getItem("provider");
      const storedLoggedAs = localStorage.getItem("loggedAs");
      if (storedProvider) {
        setProvider(storedProvider);
        // Inizializza il provider anche per sessioni ripristinate
        if (storedProvider === 'google') {
          const jsonRpcProvider = new ethers.JsonRpcProvider(process.env.REACT_APP_JSON_RPC_PROVIDER);
          setNoMetamaskProvider(jsonRpcProvider);
        }
      }
      if (storedLoggedAs) setLoggedAs(storedLoggedAs);
    }

    if (urlProvider === 'google' && urlLoggedAs) {
      try {
        const jsonRpcProvider = new ethers.JsonRpcProvider("https://base-sepolia.g.alchemy.com/v2/KxxtZXKplWuSt71LXxy-9Mr4BhucrqEP");
        setNoMetamaskProvider(jsonRpcProvider);
        setProvider('google');
        setLoggedAs(urlLoggedAs);
        localStorage.setItem("provider", 'google');
        localStorage.setItem("loggedAs", urlLoggedAs);
      } catch (error) {
        console.error("[Google Auth] Error initializing provider:", error);
      }
    }
  }, []);

  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      console.log("handleAccountsChanged", accounts);
      if (accounts.length === 0) {
        // L'utente ha disconnesso MetaMask
        console.log("MetaMask disconnesso");
        logoutMetamask(); // Chiama la funzione di logout o gestisci la disconnessione come necessario
        window.location.href = "/";
      }
    };

    // Aggiungi il listener per gli account cambiati
    //@ts-ignore
    window?.ethereum?.on('accountsChanged', handleAccountsChanged);

    // Cleanup del listener quando il componente viene smontato
    return () => {
      //@ts-ignore
      window?.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
    };
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

  const value: Web3ContextType = {
    getProvider,
    getSigner,
    isMegoModalOpen,
    openMegoModal,
    redirectToAppleLogin,
    redirectToGoogleLogin,
    closeMegoModal,
    provider,
    metamaskProvider,
    loginWithMetamask,
    section,
    setSection,
    prevSection,
    setPrevSection,
    loggedAs,
    isLoading,
    logout,
    setIsLoading,
    loadingText,
    setLoadingText,
    loginWithEmail,
    createNewWallet, // Aggiungi la funzione al contesto
  };
  return (
    <Web3Context.Provider value={value}>
      {children}
      <MegoModal isOpen={isMegoModalOpen} onClose={closeMegoModal} />
    </Web3Context.Provider>
  );
};
export type { Route };