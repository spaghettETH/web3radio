import React from "react";
import GridBackground from './GridBackground';
import Footer from "./Footer";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="flex flex-col w-full items-center relative">
            <GridBackground />
            <div className="w-full max-w-screen-lg">
                {children}
            </div>
            <Footer />
        </div>
    );
};

export default Layout;