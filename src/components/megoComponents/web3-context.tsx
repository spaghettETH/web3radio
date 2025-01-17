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
    if(localStorage.getItem("isQuestionary") === "true") {
  
     openMegoModal();
    }
  }
  useEffect(() => {
    redirectToQuestionary();
  }, []);
  function logout() {
    setProvider(null);
    setLoggedAs(null);
    localStorage.removeItem("provider");
    localStorage.removeItem("loggedAs");
    window.location.href = "/";
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