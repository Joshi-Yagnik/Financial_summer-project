/**
 * Global Theme Management System
 * Handles dark mode across all pages with persistence
 */

(function() {
  'use strict';

  // Get theme from localStorage or default to 'default'
  function getSavedTheme() {
    return localStorage.getItem("theme") || "default";
  }

  // Save theme to localStorage
  function saveTheme(theme) {
    localStorage.setItem("theme", theme);
  }

  // Determine actual theme (handles 'default' auto mode)
  function getActualTheme(savedTheme) {
    if (savedTheme === "default") {
      const hour = new Date().getHours();
      return (hour >= 19 || hour < 7) ? "dark" : "light";
    }
    return savedTheme;
  }

  // Apply theme to document
  function applyTheme(theme) {
    const actualTheme = getActualTheme(theme);
    document.documentElement.setAttribute("data-theme", actualTheme);
    document.body.setAttribute("data-theme", actualTheme);
    
    // Also set on html element for maximum compatibility
    if (document.documentElement) {
      document.documentElement.setAttribute("data-theme", actualTheme);
    }
    
    // Dispatch custom event for other scripts
    window.dispatchEvent(new CustomEvent('themechange', { 
      detail: { theme: actualTheme, savedTheme: theme } 
    }));
  }

  // Initialize theme on page load
  function initTheme() {
    const savedTheme = getSavedTheme();
    applyTheme(savedTheme);
  }

  // Public API
  window.ThemeManager = {
    // Get current saved theme
    getTheme: function() {
      return getSavedTheme();
    },

    // Set theme
    setTheme: function(theme) {
      if (!["light", "dark", "default"].includes(theme)) {
        console.warn("Invalid theme:", theme);
        return;
      }
      saveTheme(theme);
      applyTheme(theme);
    },

    // Toggle between light and dark (skips 'default')
    toggle: function() {
      const current = getSavedTheme();
      const newTheme = current === "dark" ? "light" : "dark";
      this.setTheme(newTheme);
    },

    // Get actual applied theme
    getAppliedTheme: function() {
      return getActualTheme(getSavedTheme());
    },

    // Check if dark mode is active
    isDark: function() {
      return this.getAppliedTheme() === "dark";
    }
  };

  // Apply theme immediately (before DOMContentLoaded for faster rendering)
  if (document.readyState === 'loading') {
    initTheme();
  } else {
    initTheme();
  }

  // Also apply on DOMContentLoaded as fallback
  document.addEventListener('DOMContentLoaded', initTheme);

  // Apply on window load as well
  window.addEventListener('load', initTheme);

  // Listen for storage changes (for multi-tab sync)
  window.addEventListener('storage', function(e) {
    if (e.key === 'theme') {
      applyTheme(e.newValue || "default");
    }
  });

  // Export for module systems
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.ThemeManager;
  }
})();
