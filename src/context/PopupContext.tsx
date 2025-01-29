import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PopupOptions {
    title?: string;
    message?: string;
    type?: 'success' | 'error' | 'loading' | 'info';
    banner?: ReactNode;
}

interface PopupContextType {
    isOpen: boolean;
    openPopup: (options: PopupOptions) => void;
    closePopup: () => void;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const usePopup = (): PopupContextType => {
    const context = useContext(PopupContext);
    if (!context) {
        throw new Error('usePopup deve essere usato all\'interno di un PopupProvider');
    }
    return context;
};

interface PopupProviderProps {
    children: ReactNode;
}

export const PopupProvider: React.FC<PopupProviderProps> = ({ children }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [title, setTitle] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [type, setType] = useState<'success' | 'error' | 'loading' | 'info'>('loading');
    const [customJsx, setCustomJsx] = useState<ReactNode | null>(null);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isOpen && type !== 'loading') {
            timer = setTimeout(() => {
                setCustomJsx(null);
                setIsOpen(false);
            }, 3500);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [isOpen, type]);

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return {
                    icon: (
                        <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    ),
                    color: 'text-green-500',
                    border: 'border-green-500'
                };
            case 'error':
                return {
                    icon: (
                        <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ),
                    color: 'text-red-500',
                    border: 'border-red-500'
                };
            case 'info':
                return {
                    icon: (
                        <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ),
                    color: 'text-blue-500',
                    border: 'border-blue-500'
                };
            default:
                return {
                    icon: null,
                    color: 'text-blue-500',
                    border: 'border-blue-500'
                };
        }
    };

    const openPopup = (options: PopupOptions) => {
        setTitle(options.title || 'Notifica');
        setMessage(options.message || '');
        setType(options.type || 'loading');
        setIsOpen(true);
        if(options.banner){
            setCustomJsx(options.banner);
        }
    };

    const closePopup = () => setIsOpen(false);

    const styles = getTypeStyles();

    return (
        <PopupContext.Provider value={{ isOpen, openPopup, closePopup }}>
            {children}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={type === 'loading' ? undefined : closePopup}
                    >
                        <motion.div
                            className="bg-white/95 p-8 rounded-2xl shadow-xl relative w-[90%] max-w-lg min-h-[200px] flex flex-col items-center"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ type: "spring", damping: 15 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className={`text-2xl font-semibold mb-6 ${styles.color}`}>{title}</h2>
                            <div className="flex justify-center items-center min-h-[100px] flex-col gap-4">
                                {type === 'loading' ? (
                                    <div className={`w-10 h-10 border-4 border-gray-200 ${styles.border} rounded-full animate-spin`}></div>
                                ) : (
                                    styles.icon
                                )}
                                <div className={`text-center text-lg leading-relaxed ${type === 'loading' ? 'text-gray-600' : styles.color}`}>
                                    {message}
                                </div>
                            </div>
                            {customJsx}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </PopupContext.Provider>
    );
}; 