// Bright pastel colors for usernames
const PASTEL_COLORS = [
  '#FFB3BA', // Light pink
  '#BAFFC9', // Light green
  '#BAE1FF', // Light blue
  '#FFFFBA', // Light yellow
  '#FFD1BA', // Light orange
  '#E1BAFF', // Light purple
  '#FFB3E6', // Light magenta
  '#C9FFD1', // Light mint
  '#FFE1BA', // Light peach
  '#B3E5FF', // Light sky blue
  '#F0BAFF', // Light lavender
  '#BAFFBA', // Light lime
  '#FFB3D1', // Light rose
  '#D1BAFF', // Light violet
  '#BAF0FF', // Light cyan
];

// Cache to store username-color mappings
const userColorCache = new Map();

/**
 * Get a consistent color for a username
 * @param {string} username - The username to get a color for
 * @returns {string} - The hex color code
 */
export const getUsernameColor = (username) => {
  if (!username) return PASTEL_COLORS[0];
  
  // Check cache first
  if (userColorCache.has(username)) {
    return userColorCache.get(username);
  }
  
  // Generate hash from username
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    const char = username.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Get color from array based on hash
  const colorIndex = Math.abs(hash) % PASTEL_COLORS.length;
  const color = PASTEL_COLORS[colorIndex];
  
  // Cache the result
  userColorCache.set(username, color);
  
  return color;
};

/**
 * Get text color (black/white) that contrasts with the background color
 * @param {string} backgroundColor - The background color in hex format
 * @returns {string} - Either '#000000' or '#ffffff'
 */
export const getContrastTextColor = (backgroundColor) => {
  // Convert hex to RGB
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

/**
 * Clear username color cache (useful when users leave)
 */
export const clearUserColorCache = () => {
  userColorCache.clear();
};

/**
 * Remove specific user from color cache
 * @param {string} username - Username to remove from cache
 */
export const removeUserColor = (username) => {
  userColorCache.delete(username);
};
