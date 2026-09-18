// Pharmacy Data

const pharmacyData =
    JSON.parse(localStorage.getItem("pharmacyData")) || {
        pharmacyName: "صيدلية النهضة",
        pharmacyAddress: "شارع الجامعة"
    };

document.getElementById("pharmacyName").textContent =
    pharmacyData.pharmacyName;

document.getElementById("pharmacyAddress").textContent =
    pharmacyData.pharmacyAddress;


// Dashboard Data

const dashboardData =
    JSON.parse(localStorage.getItem("dashboardData")) || {

        medicineCount: 125,

        lowStockCount: 8,

        todayOrders: 24,

        todayRevenue: 2450,

        weeklySales: [
            1200,
            1800,
            1500,
            2500,
            2200,
            3000,
            2800
        ],

       
    };


// Statistics

document.getElementById("medicineCount").textContent =
    dashboardData.medicineCount;

document.getElementById("lowStockCount").textContent =
    dashboardData.lowStockCount;

document.getElementById("todayOrders").textContent =
    dashboardData.todayOrders;

document.getElementById("todayRevenue").textContent =
    dashboardData.todayRevenue + " ج.م";


// Chart

const ctx =
    document.getElementById("salesChart");

new Chart(ctx, {

    type: "line",

    data: {

        labels: [
            "السبت",
            "الأحد",
            "الإثنين",
            "الثلاثاء",
            "الأربعاء",
            "الخميس",
            "الجمعة"
        ],

        datasets: [

            {
                label: "المبيعات",

                data:
                    dashboardData.weeklySales,

                borderColor: "#0E9F6E",

                backgroundColor:
                    "rgba(14,159,110,.15)",

                borderWidth: 3,

                fill: true,

                tension: .4
            }

        ]
    },

    options: {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

            legend: {
                display: true
            }
        }
    }
});




const menuBtn = document.getElementById("menuBtn");
const sidebar = document.querySelector(".sidebar");

menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active");
});

