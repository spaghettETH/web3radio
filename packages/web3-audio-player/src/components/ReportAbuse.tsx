import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaFlag } from 'react-icons/fa';

const ReportAbuse = () => {
  // URL del form per il report abuse
  // Ref per il tooltip
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  // Stato per memorizzare l'offset calcolato (metà larghezza del tooltip)
  const [tooltipOffset, setTooltipOffset] = useState(0);
  // Stato per controllare se il mouse è sopra il contenitore
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (tooltipRef.current) {
      const width = tooltipRef.current.offsetWidth;
      // Impostiamo l'offset pari a metà della larghezza
      setTooltipOffset(width / 2);
    }
  }, []);

  const handleClick = () => {
    window.open(process.env.REACT_APP_REPORT_ABUSE_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      className="relative inline-block cursor-pointer bg-white rounded-full p-2 shadow-2xl"
      onClick={handleClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.1 }}
    >
      {/* Icona a forma di bandiera */}
      <FaFlag size={20} className="text-black" />
      {/* Tooltip centrato dinamicamente e visibile al passaggio del mouse sull'intera area del contenitore */}
      <motion.div
        ref={tooltipRef}
        className="absolute pointer-events-none -top-8 px-2 py-1 bg-black text-white text-xs rounded"
        animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ left: `calc(50% - ${tooltipOffset}px)` }}
      >
        Report Abuse
      </motion.div>
    </motion.div>
  );
};

export default ReportAbuse;
