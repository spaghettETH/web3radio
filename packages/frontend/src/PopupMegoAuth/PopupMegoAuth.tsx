import { useWeb3Context } from '@megotickets/wallet';
import React, { useEffect } from 'react';

interface PopupMegoAuthProps {
    isActive: boolean;
    message?: string;
    encoded?: boolean;
    onSuccess?: (signature: string) => void;
    onFallback?: (error: string) => void;
}

const PopupMegoAuth = ({ isActive, message, encoded = false, onSuccess, onFallback }: PopupMegoAuthProps) => {
    const { provider } = useWeb3Context();

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

        // Open popup
        const popupWindow = window.open(
            megoUrl,
            'MegoAuth',
            `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes,location=no,status=no`
        );

        // Controlla periodicamente l'URL del popup
        const checkPopupUrl = setInterval(() => {
            if (!popupWindow || popupWindow.closed) {
                clearInterval(checkPopupUrl);
                onFallback?.('Autenticazione annullata');
                return;
            }

            try {
                // Check popup URL
                const currentUrl = popupWindow.location.href;
                // If we are back to our domain, check the signature
                if (currentUrl.includes(window.location.origin)) {
                    const url = new URL(currentUrl);
                    const signature = url.searchParams.get('signature');
                    
                    if (signature) {
                        onSuccess?.(signature);
                        popupWindow.close();
                    }
                    clearInterval(checkPopupUrl);
                }
            } catch (error) {
                // Ignora gli errori di same-origin policy
                // Questo errore si verifica quando il popup è su wallet.mego.tools
            }
        }, 500);

        // Cleanup
        return () => {
            clearInterval(checkPopupUrl);
        };
    }, [isActive, provider, message, encoded, onSuccess, onFallback]);

    // Questo componente non renderizza nulla visivamente
    return null;
};

export default PopupMegoAuth;