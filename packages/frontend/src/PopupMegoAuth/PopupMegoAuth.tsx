import { useWeb3Context } from '@megotickets/wallet';
import React, { useEffect, useRef } from 'react';

interface PopupMegoAuthProps {
    isActive: boolean;
    message?: string;
    encoded?: boolean;
    onSuccess?: (signature: string) => void;
    onFallback?: (error: string) => void;
    onPopupClosed?: () => void;
}

const PopupMegoAuth = ({ isActive, message, encoded = false, onSuccess, onFallback, onPopupClosed }: PopupMegoAuthProps) => {
    const { provider } = useWeb3Context();
    const popupWindowRef = useRef<Window | null>(null);
    const checkPopupIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (!isActive || !provider) return;

        // Configura il popup
        const width = 500;
        const height = 600;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;

        // Costruisci l'URL di Mego
        const baseUrl = provider.includes('google') 
            ? 'https://wallet.mego.tools/auth/google'
            : 'https://wallet.mego.tools/auth/apple';

        const params = new URLSearchParams({
            origin: window.location.origin.replace("http://", "").replace("https://", ""),
            message: message || '',
            ...(encoded && { encoded: 'true' })
        });

        const megoUrl = `${baseUrl}?${params.toString()}`;

        // Apri il popup
        popupWindowRef.current = window.open(
            megoUrl,
            'MegoAuth',
            `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes,location=no,status=no`
        );

        // Controlla periodicamente lo stato del popup
        checkPopupIntervalRef.current = window.setInterval(() => {
            if (!popupWindowRef.current || popupWindowRef.current.closed) {
                // Se il popup è chiuso
                if (checkPopupIntervalRef.current) {
                    clearInterval(checkPopupIntervalRef.current);
                }
                onPopupClosed?.();
                return;
            }

            try {
                // Controlla l'URL del popup
                const currentUrl = popupWindowRef.current.location.href;
                
                // Se siamo tornati al nostro dominio, controlliamo la signature
                if (currentUrl.includes(window.location.origin)) {
                    const url = new URL(currentUrl);
                    const signature = url.searchParams.get('signature');
                    
                    if (signature) {
                        onSuccess?.(signature);
                        popupWindowRef.current.close();
                    }
                    if (checkPopupIntervalRef.current) {
                        clearInterval(checkPopupIntervalRef.current);
                    }
                }
            } catch (error) {
                // Ignora gli errori di same-origin policy
            }
        }, 500);

        // Cleanup
        return () => {
            if (checkPopupIntervalRef.current) {
                clearInterval(checkPopupIntervalRef.current);
            }
            if (popupWindowRef.current && !popupWindowRef.current.closed) {
                popupWindowRef.current.close();
            }
        };
    }, [isActive, provider, message, encoded, onSuccess, onFallback, onPopupClosed]);

    // Questo componente non renderizza nulla visivamente
    return null;
};

export default PopupMegoAuth;