import React from "react";
import MonetaLogo from "../assets/MonetaCropped.png";

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-2 mb-4 h-full justify-center">
            <img src={MonetaLogo} alt="Moneta Logo" className="w-auto h-12" />
          </div>
        </div>

        {["Product", "Company", "Resources"].map((section, idx) => (
          <div key={idx}>
            <h4 className="font-semibold text-white mb-4">{section}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-orange-500 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-500 transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-500 transition-colors">
                  Security
                </a>
              </li>
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-sm">
        © 2025 Moneta. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
