import React from 'react';
import { motion } from 'framer-motion';

const ClaimTokenNotice: React.FC = () => {
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
        You don't own the token {tokenName}!
      </h2>
      <p className="text-lg text-gray-300 text-center">
        Claim the SpaghettETH Passport Sould Bound Token to access Web3Radio features.
      </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => (window.location.href = claimRedirectUrl)}
        className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2 px-4 rounded transition-all"
      >
        Claim Now
      </motion.button>
    </motion.div>
  );
};

export default ClaimTokenNotice;
