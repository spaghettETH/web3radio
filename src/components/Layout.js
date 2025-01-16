import React from "react";
import GridBackground from './GridBackground';

const Layout = ({ children }) => {
    return (
        <div className="flex flex-col w-full items-center relative">
            <GridBackground />
            <div className="w-full max-w-screen-lg">
                {children}
            </div>
        </div>
    );
};

export default Layout;