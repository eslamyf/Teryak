document.addEventListener('DOMContentLoaded', () => {
	const activeNavItem = document.querySelector('.sidebar-nav .nav-item.active');
	if (activeNavItem) {
		activeNavItem.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
	}

	const sidebarToggle = document.getElementById('sidebarToggle');
	const sidebar = document.getElementById('sidebar');
	const sidebarOverlay = document.getElementById('sidebarOverlay');

	if (sidebarToggle && sidebar && sidebarOverlay) {
		const toggleMenu = () => {
			sidebar.classList.toggle('active');
			sidebarOverlay.classList.toggle('active');
		};
		sidebarToggle.addEventListener('click', toggleMenu);
		sidebarOverlay.addEventListener('click', toggleMenu);
	}

	const chartCanvas = document.getElementById('topMedicinesChart');
	if (chartCanvas && typeof Chart !== 'undefined') {
		Chart.defaults.font.family = "'Tajawal', sans-serif";
		Chart.defaults.color = '#6b7280';
		new Chart(chartCanvas, {
			type: 'bar',
			data: {
				labels: ['باراسيتامول', 'أموكسيسيلين', 'فيتامين د', 'أوميبرازول', 'إيبوبروفين'],
				datasets: [{
					data: [4200, 3100, 2800, 2200, 1850],
					backgroundColor: '#059669',
					hoverBackgroundColor: '#047857',
					borderRadius: 5,
					borderSkipped: false,
					barThickness: 24
				}]
			},
			options: {
				indexAxis: 'y',
				responsive: true,
				maintainAspectRatio: false,
				animation: { duration: 650 },
				plugins: {
					legend: { display: false },
					tooltip: { rtl: true, titleFont: { family: 'Tajawal' }, bodyFont: { family: 'Tajawal' } }
				},
				scales: {
					x: { beginAtZero: true, max: 6000, ticks: { stepSize: 1500, font: { family: 'Tajawal', size: 10 } }, grid: { color: '#e5e7eb' } },
					y: { ticks: { font: { family: 'Tajawal', size: 10 } }, grid: { display: false } }
				}
			}
		});
	}
});
