
import axios from 'axios';

export async function fetchStockImages(query, count = 4) {

    const safe_q = query.slice(0, 100).trim();

    try {
        const res = await axios.get("https://pixabay.com/api/", {
            params: {
                q: safe_q,
                per_page: count,
                key: process.env.PIXABAY_API_KEY
            }
        });

        return (res.data.hits || []).map(photo => ({
            url: photo.largeImageURL,
            alt: photo.tags || query,
            width: photo.imageWidth,
            height: photo.imageHeight
        }));
    } catch (e) {
        console.log("Pixabay fetch error:", e.response?.data || e.message);
        return [];
    }
}