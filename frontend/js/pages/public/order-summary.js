/**
 * Teryak Platform - Order Summary Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const paymentMethod2 = document.getElementById('paymentMethod2');
  const paymentMethod = localStorage.getItem('paymentMethod') || 'الدفع عند الاستلام';

  if (paymentMethod2) {
    if (paymentMethod === 'byHand' || paymentMethod === 'الدفع عند الاستلام') {
      paymentMethod2.textContent = 'الدفع عند الاستلام';
    } else if (paymentMethod === 'Cash' || paymentMethod === 'بطاقة بنكية') {
      paymentMethod2.textContent = 'بطاقة بنكية';
    } else if (paymentMethod === 'credit' || paymentMethod === 'محفظة إلكترونية') {
      paymentMethod2.textContent = 'محفظة إلكترونية';
    } else {
      paymentMethod2.textContent = paymentMethod;
    }
  }

  // Populate dynamic medicine data
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
    const confirmBtn = document.getElementById('confirmOrderBtn');

    if (imgEl && medicineData.img) imgEl.src = medicineData.img;
    if (nameEl && medicineData.name) nameEl.textContent = medicineData.name;
    if (subtotalEl && medicineData.price) subtotalEl.textContent = medicineData.price;

    const numeric = parseFloat(String(medicineData.price).replace(/[^0-9.]/g, '')) || 24.5;
    const finalTotal = (numeric + 15.0).toFixed(2);

    if (totalEl) totalEl.textContent = finalTotal + ' ج.م';
    if (confirmBtn) confirmBtn.textContent = `تأكيد الطلب — ${finalTotal} ج.م`;
  } catch (e) {
    console.error('Error in order summary:', e);
  }
});
