/**
 * Teryak Platform - Pharmacist Stock Exchange System
 * Integrated with Side-Sliding Toast Notifications
 */

document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll(".exchange-card");

  cards.forEach(card => {
    const acceptBtn = card.querySelector(".accept");
    const rejectBtn = card.querySelector(".reject");
    const status = card.querySelector(".status");
    const medName = card.querySelector("h4")?.textContent || 'طلب التبادل';

    // Accept request
    if (acceptBtn) {
      acceptBtn.addEventListener("click", () => {
        if (status) {
          status.innerHTML = "مكتمل";
          status.className = "status completed badge bg-success p-2";
        }
        const buttons = card.querySelector(".buttons");
        if (buttons) {
          buttons.innerHTML = '<span class="badge bg-success p-2"><i class="fa-solid fa-check me-1"></i> تم القبول بنجاح</span>';
        }
        if (window.Toast) {
          window.Toast.success(`تم قبول طلب تبادل (${medName}) وتحديث رصيد المخزون المشترك بنجاح.`, 'تم قبول التبادل');
        }
      });
    }

    // Reject request
    if (rejectBtn) {
      rejectBtn.addEventListener("click", async () => {
        if (window.Toast && window.Toast.confirm) {
          const confirmed = await window.Toast.confirm({
            title: 'رفض طلب التبادل',
            message: `هل أنت متأكد من رغبتك في رفض طلب تبادل (${medName})؟`,
            type: 'warning',
            confirmText: 'رفض الطلب',
            cancelText: 'تراجع'
          });
          if (!confirmed) return;
        }

        card.style.transition = ".4s";
        card.style.opacity = "0";
        card.style.transform = "translateX(-80px)";
        setTimeout(() => {
          card.remove();
        }, 400);

        if (window.Toast) {
          window.Toast.info(`تم رفض طلب التبادل (${medName}) وإشعار الصيدلية الطالبة.`, 'رفض الطلب');
        }
      });
    }
  });

  // Add offer / request button
  const addBtn = document.querySelector(".add-btn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      if (window.Toast) {
        window.Toast.info("يمكنك تحديد الصنف والكمية لعرضها في شبكة التبادل الدوائي للصيادلة.", "عرض دواء للتبادل");
      }
    });
  }

  // Hover animation
  cards.forEach(card => {
    card.addEventListener("mouseenter", () => {
      card.style.boxShadow = "0 15px 35px rgba(0,0,0,.08)";
    });
    card.addEventListener("mouseleave", () => {
      card.style.boxShadow = "0 0 0 rgba(0,0,0,0)";
    });
  });
});
