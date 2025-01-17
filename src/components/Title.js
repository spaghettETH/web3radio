import React from 'react';
import { motion } from 'framer-motion';

const Title = () => {
    return (
        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
                duration: 0.6,
                ease: "easeOut"
            }}
            whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
            }}
        >
            <img src={'/title.svg'} alt="Logo" />
        </motion.div>
    );
};

export default Title;
