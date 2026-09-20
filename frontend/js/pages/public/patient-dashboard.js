/**
 * Teryak Platform - Patient Dashboard Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.list ul li');
  const sections = [
    document.querySelector('.hidden1'),
    document.querySelector('.hidden2'),
    document.querySelector('.hidden3'),
    document.querySelector('.hidden4'),
    document.querySelector('.hidden5'),
    document.querySelector('.hidden6')
  ];

  items.forEach(item => {
    item.addEventListener('click', () => {
      items.forEach(li => li.classList.remove('active'));
      item.classList.add('active');
      sections.forEach(section => {
        if (section) section.style.display = 'none';
      });
      const target = document.querySelector('.' + item.dataset.target);
      if (target) target.style.display = 'block';
    });
  });

  // User Greeting
  const userNameEl = document.getElementById('userName');
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (userNameEl) {
      userNameEl.textContent = currentUser ? (currentUser.name || currentUser.email) : 'مريض ترياق';
    }
  } catch (e) {
    if (userNameEl) userNameEl.textContent = 'مريض ترياق';
  }
});