// --- AYARLAR ---
const apiUrl = "/api/weather";
const forecastUrl = "/api/forecast";
const aqiUrl = "/api/pollution";


// --- Elementler ---
const searchBox = document.querySelector("#sehirInput");
const searchBtn = document.querySelector("#araBtn");
const locationBtn = document.querySelector("#konumBtn");
const weatherIcon = document.querySelector(".weather-icon");
const errorMsg = document.querySelector("#hataMesaji");
const loader = document.querySelector("#loader");

// --- ANA FONKSİYON ---
async function checkWeather(city) {
    loader.style.display = "flex";
    try {
        const response = await fetch(`${apiUrl}?city=${city}`);

        if (!response.ok) {
            throw new Error("Şehir bulunamadı");
        }

        const data = await response.json();

        // Temel Verileri Yaz
        document.querySelector("#sehirAdi").innerHTML = data.name;
        document.querySelector("#derece").innerHTML = Math.round(data.main.temp) + "°C";
        document.querySelector("#nem").innerHTML = "%" + data.main.humidity;
        document.querySelector("#ruzgar").innerHTML = data.wind.speed + " km/s";
        document.querySelector("#hissedilen").innerHTML = Math.round(data.main.feels_like) + "°C";
        document.querySelector("#durum").innerHTML = data.weather[0].description.toUpperCase();

        // İkon Seçimi
        const iconCode = data.weather[0].icon;
        weatherIcon.className = `weather-icon fa-solid ${getWeatherIcon(iconCode)}`;

        // Görünüm Ayarları
        document.querySelector(".weather").style.display = "block";
        errorMsg.style.display = "none";

        // Diğer Fonksiyonları Çağır
        getAirQuality(data.coord.lat, data.coord.lon);
        getForecast(city);

    } catch (error) {
        document.querySelector(".weather").style.display = "none";
        errorMsg.style.display = "block";
    } finally {
        loader.style.display = "none";
    }
}

// --- TAHMİN FONKSİYONU (SAATLİK + GÜNLÜK) ---
async function getForecast(city) {
    const gunlukTahminDiv = document.getElementById('gunlukTahmin');
    const saatlikTahminDiv = document.getElementById('saatlikTahmin');

    // Temizle
    gunlukTahminDiv.innerHTML = '';
    saatlikTahminDiv.innerHTML = '';

    try {
        const response = await fetch(`${forecastUrl}?city=${city}`);
        const data = await response.json();

        // 1. SAATLİK TAHMİN (İlk 8 Veri = 24 Saat)
        const next24Hours = data.list.slice(0, 8);
        next24Hours.forEach(item => {
            const time = new Date(item.dt * 1000).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
            const temp = Math.round(item.main.temp);
            const icon = item.weather[0].icon;

            const card = `
                <div class="hourly-card">
                    <span class="hourly-time">${time}</span>
                    <img src="https://openweathermap.org/img/wn/${icon}.png" class="hourly-icon" alt="ikon">
                    <span class="hourly-temp">${temp}°</span>
                </div>
            `;
            saatlikTahminDiv.innerHTML += card;
        });

        // 2. GRAFİK GÜNCELLEME
        updateChart(next24Hours);

        // 3. 5 GÜNLÜK TAHMİN
        const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00"));
        dailyData.forEach(day => {
            const date = new Date(day.dt * 1000).toLocaleDateString('tr-TR', { weekday: 'short' });
            const temp = Math.round(day.main.temp);
            const icon = day.weather[0].icon;
            gunlukTahminDiv.innerHTML += `
                <div class="day-card">
                    <p class="day-name">${date}</p>
                    <img src="https://openweathermap.org/img/wn/${icon}.png" class="day-icon">
                    <p class="day-temp">${temp}°C</p>
                </div>`;
        });

    } catch (error) {
        console.error("Tahmin hatası:", error);
    }
}

// --- GRAFİK ---
let myChart;

function updateChart(hourlyData) {
    const ctx = document.getElementById('sicaklikGrafigi').getContext('2d');
    const labels = hourlyData.map(item => new Date(item.dt * 1000).getHours() + ":00");
    const temps = hourlyData.map(item => Math.round(item.main.temp));

    if (myChart) myChart.destroy();

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sıcaklık',
                data: temps,
                borderColor: '#4facfe',
                backgroundColor: 'rgba(79, 172, 254, 0.2)',
                borderWidth: 3,
                tension: 0.4,
                pointBackgroundColor: '#fff',
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: { ticks: { color: '#ddd' }, grid: { color: 'rgba(255,255,255,0.1)' } }
            }
        }
    });
}

// --- HAVA KALİTESİ ---
async function getAirQuality(lat, lon) {
    try {
        const res = await fetch(`${aqiUrl}?lat=${lat}&lon=${lon}`);
        const data = await res.json();
        const aqi = data.list[0].main.aqi;
        const durumlar = ["İyi", "Orta", "Hassas", "Kötü", "Tehlikeli"];
        const renkler = ["aqi-iyi", "aqi-orta", "aqi-hassas", "aqi-kotu", "aqi-tehlikeli"];

        const aqiBox = document.getElementById('aqiKutu');
        aqiBox.className = "detail-box " + renkler[aqi - 1];
        document.getElementById('aqiDurum').innerText = durumlar[aqi - 1];
    } catch (err) { console.log(err); }
}

// --- YARDIMCI ---
function getWeatherIcon(code) {
    if (code.startsWith("01")) return "fa-sun";
    if (code.startsWith("02")) return "fa-cloud-sun";
    if (code.startsWith("03") || code.startsWith("04")) return "fa-cloud";
    if (code.startsWith("09") || code.startsWith("10")) return "fa-cloud-rain";
    if (code.startsWith("11")) return "fa-cloud-bolt";
    if (code.startsWith("13")) return "fa-snowflake";
    if (code.startsWith("50")) return "fa-smog";
    return "fa-cloud";
}

function sehirSec(sehir) {
    document.getElementById('sehirInput').value = sehir;
    checkWeather(sehir);
}

// Event Listeners
searchBtn.addEventListener("click", () => checkWeather(searchBox.value));
searchBox.addEventListener("keypress", (e) => { if (e.key === "Enter") checkWeather(searchBox.value); });
locationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {

            alert("Konum alındı, hava durumu yükleniyor...");
            checkWeather("Istanbul");
        }, () => alert("Konum izni verilmedi."));
    }
});

// Modal İşlemleri
const modal = document.getElementById("modalOverlay");
document.getElementById("openAbout").onclick = () => modal.style.display = "block";
document.getElementsByClassName("close-modal")[0].onclick = () => modal.style.display = "none";
window.onclick = (event) => { if (event.target == modal) modal.style.display = "none"; }

// Tarih Saat
setInterval(() => {
    const now = new Date();
    document.getElementById('canliSaat').innerText = now.toLocaleTimeString('tr-TR');
    document.getElementById('canliTarih').innerText = now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}, 1000);

// Başlangıç
checkWeather("Istanbul");