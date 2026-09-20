/**
 * Teryak Platform - Payment Step Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const credit = document.getElementById('credit');
  const Visa = document.getElementById('Visa');
  const Cash = document.getElementById('Cash');
  const cash = document.getElementById('cash');
  const byHand = document.getElementById('byHand');

  const byHandIC = document.getElementById('byHandIC');
  const cashIC = document.getElementById('cashIC');
  const creditIC = document.getElementById('creditIC');

  if (credit) {
    credit.addEventListener('click', () => {
      if (Visa) Visa.classList.add('hideF2');
      if (cash) cash.classList.remove('hideF1');

      if (Cash) Cash.classList.remove('active');
      if (byHand) byHand.classList.remove('active');
      credit.classList.add('active');

      if (byHandIC) byHandIC.classList.add('hidenn');
      if (cashIC) cashIC.classList.add('hidenn');
      if (creditIC) creditIC.classList.remove('hidenn');
      localStorage.setItem('paymentMethod', 'محفظة إلكترونية');
    });
  }

  if (Cash) {
    Cash.addEventListener('click', () => {
      if (Visa) Visa.classList.remove('hideF2');
      if (cash) cash.classList.add('hideF1');

      if (credit) credit.classList.remove('active');
      if (byHand) byHand.classList.remove('active');
      Cash.classList.add('active');

      if (byHandIC) byHandIC.classList.add('hidenn');
      if (creditIC) creditIC.classList.add('hidenn');
      if (cashIC) cashIC.classList.remove('hidenn');
      localStorage.setItem('paymentMethod', 'بطاقة بنكية');
    });
  }

  if (byHand) {
    byHand.addEventListener('click', () => {
      if (Visa) Visa.classList.add('hideF2');
      if (cash) cash.classList.add('hideF1');

      if (credit) credit.classList.remove('active');
      if (Cash) Cash.classList.remove('active');
      byHand.classList.add('active');

      if (creditIC) creditIC.classList.add('hidenn');
      if (cashIC) cashIC.classList.add('hidenn');
      if (byHandIC) byHandIC.classList.remove('hidenn');
      localStorage.setItem('paymentMethod', 'الدفع عند الاستلام');
    });
  }

  // Next Step Navigation
  const nextBtn = document.getElementById('nextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const active = document.querySelector('.DIV1.active');
      const activeId = active ? active.id : 'byHand';

      if (activeId === 'byHand') {
        localStorage.setItem('paymentMethod', 'الدفع عند الاستلام');
        window.location.href = 'order-summary.html';
      } else if (activeId === 'Cash') {
        const visaForm = document.getElementById('Visa');
        if (visaForm && !visaForm.checkValidity()) {
          visaForm.reportValidity();
          return;
        }
        localStorage.setItem('paymentMethod', 'بطاقة بنكية');
        window.location.href = 'order-summary.html';
      } else if (activeId === 'credit') {
        const cashForm = document.getElementById('cash');
        if (cashForm && !cashForm.checkValidity()) {
          cashForm.reportValidity();
          return;
        }
        localStorage.setItem('paymentMethod', 'محفظة إلكترونية');
        window.location.href = 'order-summary.html';
      }
    });
  }

  // Populate dynamic order summary from cart or medicineData
  try {
    const medicineData = JSON.parse(localStorage.getItem('medicineData')) || {
      name: 'باراسيتامول 500 مجم',
      price: '24.50 ج.م',
      img: '../../assets/images/parst.jpg'
    };

    const imgEl = document.querySelector('.IMGG');
    const nameEl = document.querySelector('.Name');
    const subtotalEl = document.querySelector('.blk');
    const totalEl = document.querySelector('.grn');

    if (imgEl && medicineData.img) imgEl.src = medicineData.img;
    if (nameEl && medicineData.name) nameEl.textContent = medicineData.name;
    if (subtotalEl && medicineData.price) subtotalEl.textContent = medicineData.price;

    if (totalEl && medicineData.price) {
      const numeric = parseFloat(String(medicineData.price).replace(/[^0-9.]/g, '')) || 24.5;
      totalEl.textContent = (numeric + 15.0).toFixed(2) + ' ج.م';
    }
  } catch (e) {
    console.error('Error updating order summary', e);
  }
});
