import React from 'react';
import { motion } from 'framer-motion';

const Logo: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.5 }}
        >
            <img src={'/logo.svg'} alt="Logo" />
        </motion.div>
    );
};

export default Logo;
