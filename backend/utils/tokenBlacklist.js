// Simple in-memory token blacklist
// For production, use Redis or database for persistence across server restarts
class TokenBlacklist {
  constructor() {
    this.blacklistedTokens = new Set();
    this.tokenExpiries = new Map();
    
    // Clean up expired tokens every hour
    setInterval(() => this.cleanup(), 60 * 60 * 1000);
  }

  // Add token to blacklist
  blacklistToken(token, expiryTime) {
    this.blacklistedTokens.add(token);
    this.tokenExpiries.set(token, expiryTime);
  }

  // Check if token is blacklisted
  isBlacklisted(token) {
    return this.blacklistedTokens.has(token);
  }

  // Clean up expired tokens from blacklist
  cleanup() {
    const now = Date.now();
    for (const [token, expiry] of this.tokenExpiries.entries()) {
      if (expiry < now) {
        this.blacklistedTokens.delete(token);
        this.tokenExpiries.delete(token);
      }
    }
  }

  // Get blacklist size for monitoring
  getSize() {
    return this.blacklistedTokens.size;
  }
}

module.exports = new TokenBlacklist();