/**
 * Teryak Platform - Medicines Catalog Page Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const filterBtn = document.getElementById("filterBtn");
  const filter = document.getElementById("filter");
  const arrow = document.getElementById("arrow");

  if (filterBtn && filter) {
    filterBtn.addEventListener("click", function () {
      filter.classList.toggle("show");
      filterBtn.classList.toggle("change");
      if (arrow) {
        arrow.classList.toggle("bi-chevron-down");
        arrow.classList.toggle("bi-chevron-up");
      }
    });
  }

  // Active Category Tag Toggle
  const items = document.querySelectorAll(".right button, [data-category]");
  const colCards = document.querySelectorAll(".cards-row .col");

  items.forEach(item => {
    item.addEventListener("click", () => {
      items.forEach(button => button.classList.remove("active"));
      item.classList.add("active");

      const category = item.dataset.category || item.textContent.trim();
      colCards.forEach(col => {
        const info = col.querySelector(".card-body")?.textContent || '';
        if (category === "all" || category === "الكل" || info.includes(category)) {
          col.style.display = "";
        } else {
          col.style.display = "none";
        }
      });
    });
  });

  // Search Filtering
  const searchInput = document.getElementById("searchInput");

  const filterBySearch = (query) => {
    const searchValue = query.trim().toLowerCase();
    colCards.forEach(card => {
      const info = card.querySelector(".card-body")?.textContent.toLowerCase() || '';
      if (info.includes(searchValue)) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  };

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      filterBySearch(this.value);
    });

    // Check for search query parameter in URL (e.g. ?search=paracetamol)
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      searchInput.value = searchParam;
      filterBySearch(searchParam);
    }
  }

  // Sort Selection
  const sortSelect = document.getElementById("sortSelect");
  const row = document.querySelector(".cards-row");

  if (sortSelect && row) {
    sortSelect.addEventListener("change", function () {
      const cardsArr = Array.from(row.querySelectorAll(".col"));

      if (this.value === "priceLow") {
        cardsArr.sort((a, b) => {
          const priceA = parseFloat(a.querySelector(".parg")?.textContent || 0);
          const priceB = parseFloat(b.querySelector(".parg")?.textContent || 0);
          return priceA - priceB;
        });
      } else if (this.value === "priceHigh") {
        cardsArr.sort((a, b) => {
          const priceA = parseFloat(a.querySelector(".parg")?.textContent || 0);
          const priceB = parseFloat(b.querySelector(".parg")?.textContent || 0);
          return priceB - priceA;
        });
      }

      cardsArr.forEach(card => row.appendChild(card));
    });
  }

  // Notify button simulation
  const btnNotify = document.getElementById("BTNN2");
  if (btnNotify) {
    btnNotify.addEventListener("click", function () {
      const span = btnNotify.querySelector("span");
      if (span) span.textContent = '✓ تم تفعيل الإشعار';
      btnNotify.classList.add('active-notify');
      alert("سيتم إشعارك فور توفر الدواء في أقرب صيدلية لك!");
    });
  }

  // Add to Cart handling
  const cartButtons = document.querySelectorAll(".addCart");
  cartButtons.forEach(btn => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const card = btn.closest(".card");
      const name = card.querySelector(".card-title")?.textContent.trim() || 'دواء';
      const priceText = card.querySelector(".parg")?.textContent.replace(/[^0-9.]/g, '') || '25';
      const price = parseFloat(priceText) || 25;
      const img = card.querySelector("img")?.src || '';

      if (window.Cart) {
        window.Cart.addItem({
          id: Date.now(),
          name: name,
          price: price,
          quantity: 1,
          image: img
        });
      }
    });
  });
});
