import React from "react";
const Layout = ({ children }) => {
    return (
        <div className="flex flex-col w-full items-center">
            <div className="w-full max-w-screen-lg">
                {children}
            </div>
        </div>
    );
};

export default Layout;