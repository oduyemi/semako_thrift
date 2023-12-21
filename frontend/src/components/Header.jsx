import React, { useState } from "react";
import { Link } from "react-router-dom";
import Button from "./elements/Button";
// import sitelogo from "../assets/images/logo/sitelogo.jpg";


export const Header = ({ isAuthenticated }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const renderMobileMenu = () => {
    if (isAuthenticated && isMobileMenuOpen) {
      return (
        <div className="md:hidden">
          {/* Mobile menu items */}
          <Link to="/" className="text-l block py-2 hover:text-butter">
            <img src="" alt="logo" />
          </Link>
          <Link to="/dashboard" className="text-l block py-2 hover:text-butter">Dashboard</Link>
          <Link to="/about" className="text-l block py-2 hover:text-butter">About</Link>
          <Link to="/register"><Button>Join Semako Thrift</Button></Link>
        </div>
      );
    }
    return null;
  };

  return (
    <header>
      <nav id="header" className="bg-transparent main_header">
        <div className=" mt-0 py-1 flex items-center justify-between">
          <div className="mobile-menu-button md:hidden">
            <button className="text-white p-2" onClick={toggleMobileMenu}>
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M12 4H4a1 1 0 100 2h8a1 1 0 100-2zM4 10a1 1 0 110-2h8a1 1 0 110-2H4zm8 3a1 1 0 100 2H4a1 1 0 100-2h8z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          {renderMobileMenu()}
          <ul className={`nav-menu-wrapper flex-col md:flex-row flex md:space-x-8 mt-4 md:mt-0 md:text-l md:font-medium`} id="mobile-menu">
            <li><Link to="/" className="text-l block py-2 hover:text-butter mx-auto logo">
              <img src="" alt="logo" width="70%" />
            </Link></li>
            <li>
              <Link to="/dashboard" className="text-white hover:bg-gray-50 border-b border-gray-100 md:hover:bg-transparent md:border-0 block pl-3 pr-4 py-2 md:hover:text-butter md:p-0">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-white hover:bg-gray-50 border-b border-gray-100 md:hover:bg-transparent md:border-0 block pl-3 pr-4 py-2 md:hover:text-butter md:p-0">
                About
              </Link>
            </li>
            {/* <li>
              <Link to="/" className="text-white hover:bg-gray-50 border-b border-gray-100 md:hover:bg-transparent md:border-0 block pl-3 pr-4 py-2 md:hover:text-butter md:p-0">
                Login
              </Link>
            </li> */}
            <li>
            <Link to="/register"><Button className="text-white ml-auto">Join Semako Thrift</Button></Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};
