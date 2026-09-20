/**
 * Teryak Platform - Home Page Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Back to Top Arrow
  const arow = document.getElementById('arow');
  if (arow) {
    window.addEventListener('scroll', () => {
      if (window.scrollY >= 250) {
        arow.style.display = 'flex';
      } else {
        arow.style.display = 'none';
      }
    });

    arow.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Hero Medicine Search
  const searchInput = document.getElementById('heroSearchInput');
  const searchBtn = document.getElementById('heroSearchBtn');

  const executeSearch = () => {
    if (!searchInput) return;
    const query = searchInput.value.trim();
    if (query) {
      window.location.href = `pages/public/medicines.html?search=${encodeURIComponent(query)}`;
    } else {
      window.location.href = `pages/public/medicines.html`;
    }
  };

  if (searchBtn) {
    searchBtn.addEventListener('click', executeSearch);
  }

  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        executeSearch();
      }
    });
  }
});
