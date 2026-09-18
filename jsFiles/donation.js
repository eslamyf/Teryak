document.addEventListener('DOMContentLoaded', () => 
    {
    const browseTabBtn = document.getElementById('tabBrowseBtn');
    const donateTabBtn = document.getElementById('tabDonateBtn');
    const browseTabContent = document.getElementById('browseTabContent');
    const donateTabContent = document.getElementById('donateTabContent');

    const btnOpDonate = document.getElementById('btnOpDonate');
    const btnOpExchange = document.getElementById('btnOpExchange');
    const exchangeField = document.getElementById('exchangeField');
    const exchangeTargetInput = document.getElementById('exchangeTargetInput');
    const formHeading = document.getElementById('formHeading');
    const btnSubmitForm = document.getElementById('btnSubmitForm');
    const formMedName = document.getElementById('formMedName');
    const donationForm = document.getElementById('donationForm');

    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const hiddenGrid = document.getElementById('hiddenMedicinesGrid');

    function switchMainTab(tabName) 
    {
        if (tabName === 'browse') 
            {
             browseTabContent.classList.add('active');
             donateTabContent.classList.remove('active');
             browseTabBtn.classList.add('active');
             browseTabBtn.setAttribute('aria-selected', 'true');
             donateTabBtn.classList.remove('active');
             donateTabBtn.setAttribute('aria-selected', 'false');
            } 
        else 
            {
             donateTabContent.classList.add('active');
             browseTabContent.classList.remove('active');
             donateTabBtn.classList.add('active');
             donateTabBtn.setAttribute('aria-selected', 'true');
             browseTabBtn.classList.remove('active');
             browseTabBtn.setAttribute('aria-selected', 'false');
            }
    }

    function setOperationType(type) 
    {
        if (type === 'donate') 
            {
             btnOpDonate.className = 'op-btn active-donate';
             btnOpDonate.setAttribute('aria-checked', 'true');
             btnOpExchange.className = 'op-btn';
             btnOpExchange.setAttribute('aria-checked', 'false');
             exchangeField.classList.remove('show');
             formHeading.textContent = 'تبرع بدواء';
             btnSubmitForm.textContent = 'إرسال طلب التبرع';
             btnSubmitForm.classList.remove('btn-purple');
            } 
            else 
            {
             btnOpDonate.className = 'op-btn';
             btnOpDonate.setAttribute('aria-checked', 'false');
             btnOpExchange.className = 'op-btn active-exchange';
             btnOpExchange.setAttribute('aria-checked', 'true');
             exchangeField.classList.add('show');
             formHeading.textContent = 'استبدال دواء';
             btnSubmitForm.textContent = 'إرسال طلب الاستبدال';
             btnSubmitForm.classList.add('btn-purple');
            }
    }

    function redirectToExchangeForm(medicineName) 
    {
        switchMainTab('donate');
        setOperationType('exchange');
        if (exchangeTargetInput) exchangeTargetInput.value = medicineName;
        if (formMedName) formMedName.focus();
    }

    function toggleMoreMedicines() 
    {
        const isHidden = hiddenGrid.hasAttribute('hidden');
        if (isHidden) 
        {
            hiddenGrid.removeAttribute('hidden');
            hiddenGrid.setAttribute('aria-hidden', 'false');
            loadMoreBtn.textContent = 'عرض أقل';
        } 
        else 
        {
            hiddenGrid.setAttribute('hidden', '');
            hiddenGrid.setAttribute('aria-hidden', 'true');
            loadMoreBtn.textContent = 'عرض المزيد من الأدوية';
        }
    }

    browseTabBtn?.addEventListener('click', () => switchMainTab('browse'));
    donateTabBtn?.addEventListener('click', () => switchMainTab('donate'));
    btnOpDonate?.addEventListener('click', () => setOperationType('donate'));
    btnOpExchange?.addEventListener('click', () => setOperationType('exchange'));
    loadMoreBtn?.addEventListener('click', toggleMoreMedicines);

    document.addEventListener('click', (e) => 
    {
        const targetBtn = e.target.closest('.btn-exchange-action');
        if (targetBtn) 
        {
            redirectToExchangeForm(targetBtn.dataset.medicine || '');
        }
    });

    donationForm?.addEventListener('submit', (e) => 
    {
        e.preventDefault();
        const medName = formMedName.value.trim();
        const isExchange = btnOpExchange.classList.contains('active-exchange');
        alert(`تم إرسال طلب ${isExchange ? 'استبدال' : 'تبرع'} بنجاح للدواء: (${medName})`);
        donationForm.reset();
        setOperationType('donate');
        switchMainTab('browse');
    });
});
let btnAction=document.querySelectorAll(".btn-action")
btnAction.forEach(function(el){
    el.addEventListener("click",function(){
        alert("تم الطلب، ستصلك رسالة تأكيد")
        el.innerHTML='تم الطلب'
    })
})