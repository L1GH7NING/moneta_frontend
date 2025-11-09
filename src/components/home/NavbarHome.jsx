import React, { useState, useEffect } from "react";
import { DollarSign, Menu, X } from "lucide-react";
import MonetaLogo from "../../assets/MonetaCropped.png";
import { Link } from "react-router-dom";

const NavbarHome = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Link to={"/"}>
              <img
                src={MonetaLogo}
                alt="Moneta Logo"
                className=" h-12 w-auto"
              />
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {["Features", "About", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-gray-700 hover:text-orange-600 transition-colors duration-200 relative group"
              >
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
            <Link
              to={"/dashboard"}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg hover:text-white transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Get Started
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-orange-100 transition-colors duration-200"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden bg-white/95 backdrop-blur-md`}
      >
        <div className="px-4 pt-2 pb-4 space-y-2">
          {["Features", "About", "Contact"].map((item, idx) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="block px-4 py-3 text-gray-700 hover:bg-orange-50 rounded-lg transition-all duration-200 transform hover:translate-x-2"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {item}
            </a>
          ))}
          <button className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavbarHome;
