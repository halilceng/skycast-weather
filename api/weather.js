export default async function handler(req, res) {

    const apiKey = process.env.OPENWEATHER_API_KEY;
    const { city, lat, lon } = req.query;

    let url = "";

    if (city) {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=tr`;
    } else if (lat && lon) {
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=tr`;
    } else {
        return res.status(400).json({ error: "Şehir veya koordinat gerekli" });
    }

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "API Hatası" });
    }
}