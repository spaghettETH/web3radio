import React, { useEffect, useState } from "react";
import { Route, useWeb3Context } from "./web3-context";
import WalletConnectButton from "./WalletConnectButton"

interface MegoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MegoModal: React.FC<MegoModalProps> = ({ isOpen, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const {
    isLoading,
    loggedAs,
    logout,
    loadingText,
    section,
    setSection,
    prevSection,
    setPrevSection,
  } = useWeb3Context(); // Aggiungi il contesto per il loading

  useEffect(() => {
    if (isOpen) {
      if (loggedAs) {
        setSection("Logged");
      } else {
        setNewSection("ChooseType");
      }
      setIsClosing(false);
    }
  }, [isOpen, loggedAs]);
  useEffect(() => {
    if (loggedAs && isOpen) {
      setTimeout(() => {
        setSection("Logged");
      }, 100);
    }
  }, [loggedAs, isOpen]);
  function setNewSection(route: Route) {
    setSection(route);
    if (route === "ChooseType") setPrevSection(undefined);
    if (route === "Email") setPrevSection("ChooseType");
    if (route === "Login") setPrevSection("Email");
    if (route === "Register") setPrevSection("Email");
    if (route === "Logged") setPrevSection(undefined);
  }

  function handleClose() {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // Match this with the animation duration
  }

  function returnCurrentSection() {
    switch (section) {
      case "ChooseType":
        return <ChooseTypeSection setSection={setNewSection} />;
      case "Logged":
        return <LoggedSection logout={logout} />;
    }
  }

  if (!isOpen && !isClosing) return null;

  return (
    <div className={`mego-modal-container ${isClosing ? "closing" : ""}`}>
      <div className="mego-modal-backdrop" onClick={handleClose}></div>
      <div className="mego-modal-wrapper">
        <div className="mego-modal-header">
          <div className="d-flex align-items-center">
            <img
              height={22}
              src={"/mego.svg"}
              alt="MegoLogo"
              className="mr-2 mt-1"
            />
            <img
              height={13}
              src={"/megoLetter.svg"}
              alt="MegoLetter"
              className="ms-2"
            />
          </div>
          <div>
            {prevSection && !loggedAs && (
              <img
                role="button"
                height={16}
                onClick={() => setNewSection(prevSection)}
                src={"/arrowBack.svg"}
                alt="BackIcon"
                className="ms-2"
              />
            )}
            <img
              role="button"
              height={16}
              onClick={handleClose}
              src={"/cross.svg"}
              alt="CloseIcon"
              className="ms-2"
            />
          </div>
        </div>
        <div className="mego-modal-content" style={{ padding: 0 }}>
          <span
            style={{
              transform: "scale(0.8)",
              height: 300,
              transition: "height 0.3s",
            }}
          >
            <div className="fs-4 text-white mx-auto font-bold m-auto mt-0 mb-4 text-center">
              {section === "Register" ? "REGISTER" : "LOGIN"}
            </div>

            <>&nbsp;</>
            {isLoading ? (
              <div className="d-flex flex-column align-items-center">
                <div className="loader" />
                <p className="mego-login-text mt-4">
                  {loadingText || "Loading data..."}
                </p>
              </div>
            ) : (
              returnCurrentSection()
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

type SectionBaseProps = { setSection: (route: Route) => void };

const ChooseTypeSection: React.FC<SectionBaseProps> = ({ setSection }) => {
  const { redirectToAppleLogin, redirectToGoogleLogin } = useWeb3Context();

  return (
    <>
      <button
        className={`mego-modal-button mego-apple opacity-50 cursor-not-allowed`}
        disabled={true}
        onClick={redirectToAppleLogin}>
        <img src="/apple.svg" alt="Apple" className="mr-2" />
        APPLE ACCOUNT
      </button>

      <button
        className="mego-modal-button opacity-50 cursor-not-allowed"
        disabled={true}
        onClick={redirectToGoogleLogin}>
        <img width={17} src="/google.svg" alt="Google" className="mr-2 mt-1" />
        GOOGLE ACCOUNT
      </button>


      <WalletConnectButton />
    </>
  );
};

const LoggedSection: React.FC<{ logout: () => void }> = ({ logout }) => {
  return (
    <>
      {/* <button
        className="mego-modal-button outlined"
        onClick={() => {
          const address = localStorage.getItem("loggedAs");
          window.open(`https://nft.etnadivino.com?address=${address}`, "_blank")
        }}
      >
        <img src={"/imageLogo.svg"} alt="NftLogo" className="mr-2" />
        Visualizza NFTs
      </button> */}
      <button className="mego-modal-button outlined" onClick={logout}>
        <img src={"/turnOff.svg"} alt="TurnOff" className="mr-2" />
        LOGOUT
      </button>
    </>
  );
};

export default MegoModal;
