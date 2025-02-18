import React from 'react';
import { motion } from 'framer-motion';
import { MegoWalletButton } from "@megotickets/wallet";

const ConnectWithMego: React.FC = () => {
  // Otteniamo il nome del token e l'URL di claim dalle variabili di ambiente
  const tokenName = process.env.REACT_APP_TOKEN_NAME || "TOKEN";
  const claimRedirectUrl = process.env.REACT_APP_CLAIM_REDIRECT_URL || "/";

  // Varianti per l'animazione della container principale
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center gap-4 bg-black/90 text-white py-8 px-6 rounded-xl shadow-2xl"
    >
      <h2 className="text-2xl font-bold uppercase">
        Connect with MEGO
      </h2>
      <p className="text-lg text-gray-300 text-center">
        Connect with MEGO to access the platform
      </p>
      <MegoWalletButton
        providerConfiguration={{
          appleProvider: false,
          googleProvider: false,
          emailProvider: false,
        }}
        customStyle={{
          megoWalletContainerStyle: {
            borderColor: "white",
            color: "white",
          },
          megoWalletIconStyle: {
            stroke: "white",
          },
        }} />
    </motion.div>
  );
};

export default ConnectWithMego;