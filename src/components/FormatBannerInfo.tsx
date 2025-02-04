import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import "../styles/AnimatedBorder.css";

interface BannerData {
    title: string;
    description?: string;
    icon: React.ReactNode;
}

interface FormatBannerInfoProps {
    radiusColor?: string;
    bannerData: BannerData;
    circleWidth?: number;
}

const FormatBannerInfo = ({ bannerData, radiusColor = "blue", circleWidth = 50 }: FormatBannerInfoProps) => {
    const iconRef = useRef<HTMLDivElement>(null);
    const [tooltipLeft, setTooltipLeft] = useState<number>(0);

    useEffect(() => {
        if (iconRef.current) {
            const margin = 8;
            setTooltipLeft(iconRef.current.offsetWidth + margin);
        }
    }, [circleWidth]);

    const tooltipVariants = {
        rest: {
            opacity: 0,
            x: -10,
            transition: { duration: 0.2 }
        },
        hover: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.2 }
        }
    };

    return (
        <motion.div
            className="relative inline-block"
            initial="rest"
            whileHover="hover"
            animate="rest"
        >
            <motion.div
                ref={iconRef}
                style={{
                    width: circleWidth,
                    height: circleWidth,
                    cursor: "help"
                }}
                className="flex items-center justify-center"
            >
                <span className="text-current">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M12 22C6.485 22 2 17.515 2 12S6.485 2 12 2s10 4.485 10 10-4.485 10-10 10z" />
                    </svg>
                </span>
            </motion.div>
            <motion.div
                variants={tooltipVariants}
                style={{ left: tooltipLeft }}
                className={`absolute top-1/2 transform -translate-y-1/2 p-4 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-10 ${radiusColor}`}
            >
                <div className="flex items-center">
                    {bannerData.icon && <span className="mr-2">{bannerData.icon}</span>}
                    <span className="font-bold">{bannerData.title}</span>
                </div>
                {bannerData.description && (
                    <h1 className="mt-1">
                        {bannerData.description}
                    </h1>
                )}
            </motion.div>
        </motion.div>
    );
}

export default FormatBannerInfo;