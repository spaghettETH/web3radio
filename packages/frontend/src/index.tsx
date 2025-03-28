import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Layout from './components/Layout';
//import { Web3Provider } from './components/megoComponents/web3-context';
import { Web3RadioProvider } from './context/Web3RadioContext';
import { PopupProvider } from './context/PopupContext';
//RainbowKit
import '@rainbow-me/rainbowkit/styles.css';



import { Web3MegoClientProvider } from "@megotickets/wallet";
import {Web3Provider } from "@megotickets/core";

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <Web3Provider>
      {/* @ts-ignore */}
      <Web3MegoClientProvider>
        <Layout>
          <PopupProvider>
            <Web3RadioProvider>
              <App />
            </Web3RadioProvider>
          </PopupProvider>
        </Layout>
      </Web3MegoClientProvider>
    </Web3Provider>
  </React.StrictMode >
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

