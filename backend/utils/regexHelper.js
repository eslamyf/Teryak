/**
 * Utility to escape regex special characters to prevent ReDoS & syntax crashes
 * @param {string} string - The input query string
 * @returns {string} - Escaped string safe for new RegExp()
 */
const escapeRegex = (string = '') => {
  if (typeof string !== 'string') return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

module.exports = { escapeRegex };
