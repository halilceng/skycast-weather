export default async function handler(req, res) {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const { city } = req.query;

    if (!city) return res.status(400).json({ error: "Şehir gerekli" });

    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=tr`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "API Hatası" });
    }
}