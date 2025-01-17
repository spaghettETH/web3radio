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
import { BrowserProvider } from "ethers";
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
  const [loggedAs, setLoggedAs] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>("");
  const openMegoModal = (): void => {
    setIsMegoModalOpen(true);
    setIsLoading(false); // Reset loading state when opening modal
  };

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
      setLoggedAs(check.data.addresses.eth);
      localStorage.setItem("loggedAs", check.data.addresses.eth);
      localStorage.setItem("provider", "email");
      localStorage.setItem("email", email);
      setProvider("email");
    } else {
      setLoadingText("");
      alert(check.data.message);
      setIsLoading(false);
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
    } catch (error) {
      console.error("Error initializing provider:", error);
      console.log(error);
      alert("Failed to connect to MetaMask.");
    } finally {
      setIsLoading(false);
      setLoadingText("");
    }
  };

  const logoutMetamask = () => {

    try{
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
  useEffect(()=>{
    const megoProvider = localStorage.getItem("provider");
    if(megoProvider === 'metamask'){
      loginWithMetamask();
    }
  },[])

  useEffect(() => {
    // Recupera i dati dall'URL
    const searchParams = new URLSearchParams(window.location.search);
    const urlProvider = searchParams.get("provider");
    const urlLoggedAs = searchParams.get("loggedAs");

    // Se ci sono dati nell'URL, salvali nello stato e nel localStorage
    if (urlProvider) {
      setProvider(urlProvider);
      localStorage.setItem("provider", urlProvider);
    }
    if (urlLoggedAs) {
      setLoggedAs(urlLoggedAs);
      localStorage.setItem("loggedAs", urlLoggedAs);
    }

    // Se non ci sono dati nell'URL, prova a recuperarli dal localStorage
    if (!urlProvider && !urlLoggedAs) {
      const storedProvider = localStorage.getItem("provider");
      const storedLoggedAs = localStorage.getItem("loggedAs");
      if (storedProvider) setProvider(storedProvider);
      if (storedLoggedAs) setLoggedAs(storedLoggedAs);
    }
  }, []);

  const value: Web3ContextType = {
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