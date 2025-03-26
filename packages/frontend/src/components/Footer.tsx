import React from 'react';
import { FaXTwitter, FaTelegram, FaGithub, FaEnvelope } from 'react-icons/fa6';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-black text-white py-6 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold mb-2">Decentralized WebRadio</h3>
            <p className="text-gray-400">The first decentralized radio in Italy</p>
          </div>
          
          <div className="flex space-x-6 mb-4">
            <a 
              href="https://x.com/web3radioitaly" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Twitter"
            >
              <FaXTwitter size={24} />
            </a>
            <a 
              href="https://t.me/+rYk4v5bFHSo5YTQy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Telegram"
            >
              <FaTelegram size={24} />
            </a>
            <a 
              href="https://github.com/spaghettETH/web3radio" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <FaGithub size={24} />
            </a>
            <a 
              href="mailto:web3radioitaly@gmail.com" 
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Email"
            >
              <FaEnvelope size={24} />
            </a>
          </div>
          
          <div className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Decentralized WebRadio. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;