import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Layout from './components/Layout';
import { Web3Provider } from './components/megoComponents/web3-context';
import { Web3RadioProvider } from './context/Web3RadioContext';
import { PopupProvider } from './context/PopupContext';
//RainbowKit
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { sepolia, optimism } from 'wagmi/chains';
import { QueryClientProvider, QueryClient, } from "@tanstack/react-query";

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const config = getDefaultConfig({
  appName: 'Web3Radio',
  projectId: 'YOUR_PROJECT_ID',
  chains: [sepolia, optimism],
  ssr: false,
});

const queryClient = new QueryClient();

root.render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Layout>
            <PopupProvider>
              <Web3Provider>
                <Web3RadioProvider>
                  <App />
                </Web3RadioProvider>
              </Web3Provider>
            </PopupProvider>
          </Layout>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode >
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

