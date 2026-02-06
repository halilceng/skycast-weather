//  API KEY 
const apiKey = "1a4ab5ff7872d2e3a7df6ed2e654039d";


const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&lang=tr";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?units=metric&lang=tr";
const searchBox = document.querySelector("#sehirInput");
const errorMsg = document.querySelector("#hataMesaji");
const loader = document.querySelector("#loader");

let myChart = null;

// Genişletilmiş Arka Plan Listesi
const backgrounds = {
    Clear: "url('https://images.unsplash.com/photo-1601297183305-6df142704ea2?q=80')",
    Clouds: "url('https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80')",
    Rain: "url('https://images.unsplash.com/photo-1519692933481-e162a57d6721?q=80')",
    Snow: "url('https://images.unsplash.com/photo-1491002052546-bf38f186af56?q=80')",
    Thunderstorm: "url('https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?q=80')",
    Drizzle: "url('https://images.unsplash.com/photo-1556485689-33e55ab56ce0?q=80')",
    Mist: "url('https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227?q=80')",
    Fog: "url('https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227?q=80')",
    Haze: "url('https://images.unsplash.com/photo-1522163723043-478ef79a5bb4?q=80')",
    Dust: "url('https://images.unsplash.com/photo-1545134969-8a83446b110b?q=80')",
    Default: "url('https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80')"
};

async function checkWeather(city) {
    loader.style.display = "flex";
    errorMsg.style.display = "none";
    document.querySelector(".weather").style.display = "none";

    try {
        const response = await fetch(apiUrl + `&q=${city}&appid=${apiKey}`);
        if (response.status == 404) {
            errorMsg.style.display = "block";
            loader.style.display = "none";
            return;
        }

        const data = await response.json();

        document.querySelector("#sehirAdi").innerHTML = data.name;
        document.querySelector("#derece").innerHTML = Math.round(data.main.temp) + "°C";
        document.querySelector("#durum").innerHTML = data.weather[0].description.toUpperCase();
        document.querySelector("#nem").innerHTML = "%" + data.main.humidity;
        document.querySelector("#ruzgar").innerHTML = data.wind.speed + " km/s";
        document.querySelector("#hissedilen").innerHTML = Math.round(data.main.feels_like) + "°C";

        const iconCode = data.weather[0].icon;
        const iconElement = document.querySelector(".weather-icon");
        iconElement.className = "weather-icon fa-solid";
        iconElement.classList.add(getIconClass(iconCode));

        const condition = data.weather[0].main;
        document.body.style.backgroundImage = backgrounds[condition] || backgrounds["Default"];

        await getAirQuality(data.coord.lat, data.coord.lon);
        await getForecast(city);

        document.querySelector(".weather").style.display = "block";

    } catch (error) { console.log(error); } finally { loader.style.display = "none"; }
}


function getIconClass(iconCode) {
    const code = iconCode.substring(0, 2);
    const isDay = iconCode.endsWith('d');

    switch (code) {
        case '01':
            return isDay ? 'fa-sun' : 'fa-moon'; // Açık (Güneş / Ay)
        case '02':
            return isDay ? 'fa-cloud-sun' : 'fa-cloud-moon'; // Az Bulutlu
        case '03':
            return 'fa-cloud'; // Bulutlu
        case '04':
            return 'fa-cloud'; // Parçalı Bulutlu
        case '09':
            return 'fa-cloud-showers-heavy'; // Sağanak
        case '10':
            return 'fa-cloud-rain'; // Yağmur
        case '11':
            return 'fa-cloud-bolt'; // Gök Gürültülü
        case '13':
            return 'fa-snowflake'; // Kar
        case '50':
            return 'fa-smog'; // Sis
        default:
            return 'fa-cloud';
    }
}

async function getAirQuality(lat, lon) {
    const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    try {
        const response = await fetch(aqiUrl);
        const data = await response.json();
        const aqiIndex = data.list[0].main.aqi;

        const aqiKutu = document.querySelector("#aqiKutu");
        const aqiYazi = document.querySelector("#aqiDurum");
        aqiKutu.className = "detail-box";

        let durum = "";
        let sinif = "";
        switch (aqiIndex) {
            case 1:
                durum = "Mükemmel";
                sinif = "aqi-iyi";
                break;
            case 2:
                durum = "İyi";
                sinif = "aqi-orta";
                break;
            case 3:
                durum = "Orta";
                sinif = "aqi-hassas";
                break;
            case 4:
                durum = "Kötü";
                sinif = "aqi-kotu";
                break;
            case 5:
                durum = "Tehlikeli";
                sinif = "aqi-tehlikeli";
                break;
        }
        aqiYazi.innerText = durum;
        aqiKutu.classList.add(sinif);
    } catch (error) { console.log("AQI Hatası", error); }
}

async function getForecast(city) {
    try {
        const response = await fetch(forecastUrl + `&q=${city}&appid=${apiKey}`);
        const data = await response.json();

        const chartList = data.list.slice(0, 8);
        const labels = chartList.map(item => new Date(item.dt * 1000).getHours() + ":00");
        const temps = chartList.map(item => Math.round(item.main.temp));
        drawChart(labels, temps);

        const dailyList = data.list.filter(item => item.dt_txt.includes("12:00:00"));
        const forecastContainer = document.querySelector("#gunlukTahmin");
        forecastContainer.innerHTML = "";

        dailyList.forEach(day => {
            const date = new Date(day.dt * 1000);
            const dayName = date.toLocaleDateString('tr-TR', { weekday: 'short' });
            const temp = Math.round(day.main.temp);
            const iconUrl = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;
            const cardHtml = `<div class="day-card"><p class="day-name">${dayName}</p><img src="${iconUrl}" class="day-icon"><p class="day-temp">${temp}°C</p></div>`;
            forecastContainer.innerHTML += cardHtml;
        });
    } catch (error) { console.log("Forecast Hatası", error); }
}

function drawChart(labels, temps) {
    const ctx = document.getElementById('sicaklikGrafigi').getContext('2d');
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
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: '#ddd', font: { size: 10 } }, grid: { display: false } },
                y: { ticks: { color: '#ddd', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.1)' } }
            }
        }
    });
}

document.querySelector("#araBtn").addEventListener("click", () => checkWeather(searchBox.value));
searchBox.addEventListener("keypress", (e) => { if (e.key === "Enter") checkWeather(searchBox.value); });
document.querySelector("#konumBtn").addEventListener("click", () => { alert("Grafik ve Tahmin özelliği için lütfen şehir ismiyle arama yapın."); });
window.sehirSec = function(sehir) {
    searchBox.value = sehir;
    checkWeather(sehir);
}

// SAAT VE TARİH FONKSİYONU 
setInterval(() => {
    const s = new Date();
    // Saat
    document.getElementById("canliSaat").innerText = s.toLocaleTimeString();
    // Tarih
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    document.getElementById("canliTarih").innerText = s.toLocaleDateString('tr-TR', options);
    // Footer yılı
    document.getElementById("yil").innerText = s.getFullYear();
}, 1000);

const modal = document.getElementById("modalOverlay");
document.getElementById("openAbout").onclick = () => modal.style.display = "block";
document.querySelector(".close-modal").onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; }