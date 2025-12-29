/**
 * Authentication State Manager
 * 
 * Centralized authentication state management for the entire application.
 * Ensures all operations have valid user authentication and uid.
 */

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/**
 * Authentication Manager Class
 * Singleton pattern to manage auth state across the application
 */
class AuthManager {
  constructor() {
    this.auth = null;
    this.currentUser = null;
    this.listeners = [];
    this.initialized = false;
  }

  /**
   * Initialize authentication manager
   * @param {Object} auth - Firebase Auth instance
   * @param {Function} onAuthChange - Callback when auth state changes
   */
  init(auth, onAuthChange = null) {
    if (this.initialized) {
      console.warn('AuthManager already initialized');
      return;
    }

    this.auth = auth;
    this.initialized = true;

    // Set up auth state listener
    onAuthStateChanged(auth, (user) => {
      const previousUser = this.currentUser;
      this.currentUser = user;

      // Notify all listeners
      this.listeners.forEach(listener => {
        try {
          listener(user, previousUser);
        } catch (error) {
          console.error('Error in auth listener:', error);
        }
      });

      // Call custom callback if provided
      if (onAuthChange) {
        onAuthChange(user, previousUser);
      }
    });
  }

  /**
   * Get current authenticated user
   * @returns {Object|null} Current user or null if not authenticated
   */
  getCurrentUser() {
    if (!this.initialized) {
      throw new Error('AuthManager not initialized. Call init() first.');
    }
    return this.currentUser;
  }

  /**
   * Get current user's UID
   * @returns {string} User UID
   * @throws {Error} If user is not authenticated
   */
  getCurrentUserId() {
    const user = this.getCurrentUser();
    if (!user || !user.uid) {
      throw new Error('User is not authenticated. UID is required for this operation.');
    }
    return user.uid;
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user is authenticated
   */
  isAuthenticated() {
    try {
      return this.getCurrentUser() !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Require authentication - throws error if not authenticated
   * @returns {string} User UID
   * @throws {Error} If user is not authenticated
   */
  requireAuth() {
    if (!this.isAuthenticated()) {
      throw new Error('Authentication required. Please log in to continue.');
    }
    return this.getCurrentUserId();
  }

  /**
   * Add auth state change listener
   * @param {Function} listener - Callback function(user, previousUser)
   * @returns {Function} Unsubscribe function
   */
  onAuthStateChange(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Listener must be a function');
    }

    this.listeners.push(listener);

    // If already have a user, call listener immediately
    if (this.currentUser) {
      try {
        listener(this.currentUser, null);
      } catch (error) {
        console.error('Error in auth listener:', error);
      }
    }

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Redirect to login if not authenticated
   * @param {string} redirectUrl - URL to redirect to after login
   */
  requireAuthOrRedirect(redirectUrl = 'login.html') {
    if (!this.isAuthenticated()) {
      // Store intended destination
      if (redirectUrl !== 'login.html') {
        sessionStorage.setItem('redirectAfterLogin', window.location.href);
      }
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  }

  /**
   * Validate UID matches current user
   * @param {string} userId - User ID to validate
   * @throws {Error} If UID doesn't match current user
   */
  validateUserId(userId) {
    const currentUid = this.getCurrentUserId();
    if (userId !== currentUid) {
      throw new Error('Unauthorized: User ID does not match authenticated user');
    }
    return true;
  }
}

// Create singleton instance
const authManager = new AuthManager();

// Export singleton instance
export default authManager;

// Also export as named export for convenience
export { authManager };

/**
 * Convenience functions for common operations
 */

/**
 * Get current user UID (convenience function)
 * @returns {string} User UID
 */
export function getCurrentUserId() {
  return authManager.getCurrentUserId();
}

/**
 * Check if user is authenticated (convenience function)
 * @returns {boolean}
 */
export function isAuthenticated() {
  return authManager.isAuthenticated();
}

/**
 * Require authentication (convenience function)
 * @returns {string} User UID
 */
export function requireAuth() {
  return authManager.requireAuth();
}

/**
 * Initialize auth manager (convenience function)
 * @param {Object} auth - Firebase Auth instance
 * @param {Function} onAuthChange - Optional callback
 */
export function initAuth(auth, onAuthChange = null) {
  authManager.init(auth, onAuthChange);
}

