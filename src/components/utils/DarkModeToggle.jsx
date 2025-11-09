// --- START OF FILE DarkModeToggle.jsx ---

import React, { useEffect, useState } from 'react';

const THEME_KEY = 'theme';

// This function determines the initial theme
function getInitialTheme() {
  // 1. Check for a saved theme in localStorage
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme;
  }

  // 2. If no saved theme, check the user's OS preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  // 3. Default to light mode
  return 'light';
}

export default function DarkModeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);

  // This effect applies the theme to the <html> element
  useEffect(() => {
    const root = document.documentElement;
    
    // The KEY FIX: Only add or remove the 'dark' class.
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Save the user's choice to localStorage
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      console.error("Failed to save theme to localStorage:", e);
    }
  }, [theme]);

  // This function flips the theme state
  function toggle() {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}