import storyboard from './assets/storyboard.json';

const landCoverMap = {
    10: "Tree Cover",
    20: "Shrubland",
    30: "Grassland",
    40: "Cropland",
    50: "Wetland",
    60: "Water",
    70: "Urban",
    80: "Bare Soil",
    90: "Snow/Ice",
    100: "Mangroves",
    110: "Sparse Vegetation",
    120: "Unknown"
};

async function isUrban(lat, lon, radius = 500, threshold = 50) {
  const query = `
    [out:json];
    (
        node["building"](around:${radius},${lat},${lon});
        way["building"](around:${radius},${lat},${lon});
        relation["building"](around:${radius},${lat},${lon});
    );
    out count;
  `;
  const url = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query);
  const res = await fetch(url);
  const data = await res.json();
  
  // If no elements, treat as non-urban
  const count = data.elements?.[0]?.tags?.total || 0;
  return count >= threshold;
}

async function getClimateZone(lat, lon) {
  try {
    const response = await fetch(
        `https://api.open-meteo.com/v1/climate?latitude=${lat}&longitude=${lon}`
    );
    if (!response.ok) throw new Error("Climate API request failed");
        const data = await response.json();
        return data.koppen_geiger || "Unknown";
    } catch (err) {
        console.warn("Climate API failed, using fallback", err);
        if (lat >= 66.5 || lat <= -66.5) return "Polar";
        if (lat >= 23.5 && lat <= 66.5) return "Temperate";
        if (lat >= -23.5 && lat <= 23.5) return "Tropical";
        return "Temperate";
    }
}

async function getWeather(lat, lon) {
    const apiKey = '918d1da13a53481f891230350251310';
    const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}`
    );
    const data = await response.json();
    return { condition: data.current.condition.text, time: data.location.localtime };
}

async function getCopernicusLandCover(lat, lon) {
    const apiUrl = `https://services.dataspace.copernicus.eu/cgls/lc100-point-query?lat=${lat}&lon=${lon}&year=2019`; // 2019 is the most recent data
    try {
        const res = await fetch(apiUrl);
    if (!res.ok) throw new Error("Copernicus request failed");
        const data = await res.json();
        return data?.class || null; // returns numeric class code
    } catch (err) {
        console.warn("Copernicus Land Cover request failed:", err);
        return null;
    }
}

async function getTrueRandomIndex(max) {
    try {
        const response = await fetch('https://www.random.org/integers/?num=1&min=0&max=' + (max - 1) + '&col=1&base=10&format=plain&rnd=new');
    if (!response.ok) throw new Error('Random.org request failed');
        const text = await response.text();
        const index = parseInt(text, 10);
        if (isNaN(index)) throw new Error('Invalid random number');
        return index;
    } catch (err) {
        console.warn('Random.org failed, falling back to Math.random()', err);
        return Math.floor(Math.random() * max);
    }
}

export async function generateScenario() {
    // 1. Get player coordinates
    const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
    );
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // 2. Determine urban/outskirts/wild
    let eventZone;
    const urban = await isUrban(lat, lon);
    if (urban) {
        eventZone = "Urban";
    } else {
        // Optionally: add a semi-urban threshold for Outskirts
        const outskirts = await isUrban(lat, lon, 1000, 30); // larger radius, lower threshold
        eventZone = outskirts ? "Outskirts" : "Wild";
    }

    let terrainType = null;

    // 3. Refine with Copernicus Land Cover Zone if Not Urban
    if(eventZone === 'Wild') {
        const landCoverCode = await getCopernicusLandCover(lat, lon);
        terrainType = landCoverMap[landCoverCode] || "Plains";

        // 4. Refine with Climate Zone
        const climateZone = await getClimateZone(lat, lon); // e.g., "Temperate", "Arid", "Tropical"
        terrainType = `${terrainType} (${climateZone})`; 
    }

    // 5. Get current weather
    const weather = await getWeather(lat, lon); // e.g., { condition: "Rain", time: "Night" }

    // 6. Select JSON event
    let jsonBranch;
    if(eventZone === "Urban" || eventZone === "Outskirts") {
        jsonBranch = storyboard[eventZone]; 
    } else {
        jsonBranch = storyboard["Wild"][terrainType]; 
    }

    // Randomly select an event
    const eventKeys = Object.keys(jsonBranch[weather.condition] || jsonBranch["Default"]);
    const randomIndex = await getTrueRandomIndex(eventKeys.length);
    const selectedEventKey = eventKeys[randomIndex];
    const eventData = jsonBranch[weather.condition]?.[selectedEventKey] || jsonBranch["Default"][selectedEventKey];

    // 7. Return event data to render in DOM
    return {
        eventZone,
        terrainType,
        weather,
        event: eventData
    };
}
