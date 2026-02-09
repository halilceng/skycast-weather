export default async function handler(req, res) {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const { lat, lon } = req.query;

    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "API Hatası" });
    }
}