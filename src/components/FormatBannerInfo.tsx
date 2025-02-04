import { motion } from "framer-motion";
import { FaMusic } from "react-icons/fa";
import "../styles/AnimatedBorder.css";

const FormatBannerInfo = () => {
    return (
        <div className="animated-border mt-4 rounded-md">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative bg-black text-sm text-white p-4 rounded-md"
            >
                <div className="absolute top-2 right-2">
                    <FaMusic className="text-white text-xl" />
                </div>
                <h1>Accepted Links:</h1>
                <motion.ul
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="list-disc list-inside ml-5 mt-1"
                >
                    <motion.li
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        IPFS, Swarm, Pinata URIs
                    </motion.li>
                    <motion.li
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        Links from centralized storage services (e.g. Google Drive, Dropbox)
                    </motion.li>
                </motion.ul>
            </motion.div>
        </div>
    )
}

export default FormatBannerInfo;