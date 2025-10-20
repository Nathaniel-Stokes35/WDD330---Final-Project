import { getCharacter, setCharacter, setVariable } from './state.mjs';

export async function loadJSON(path) {
    try {
        const response = await fetch(`${path}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (err) {
        console.error("Failed to load JSON:", err);
        return null;
    }
}

const storyboard = await loadJSON('/assets/storyboard.json');

export async function isUrban(lat, lon, radius = 500, threshold = 50) {
  const query = `
    [out:json][timeout:25];
    (
      node["building"](around:${radius},${lat},${lon});
      way["building"](around:${radius},${lat},${lon});
      relation["building"](around:${radius},${lat},${lon});
    );
    out count;
  `;
  const url = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query);

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const text = await res.text();
      const data = JSON.parse(text);

      // Overpass returns elements array with count info
      const count = data?.elements?.[0]?.tags?.total ?? data?.elements?.length ?? 0;
      return count >= threshold;
    } catch (err) {
      console.warn(`Overpass attempt ${attempt} failed:`, err.message);

      if (attempt < 3) {
        // Backoff: wait before retrying
        await new Promise(r => setTimeout(r, 1500 * attempt));
      } else {
        console.error("Overpass failed after 3 attempts — assuming non-urban.");
        return false; // fallback to "Wild" to keep game flowing
      }
    }
  }
}

export async function getWeather(lat, lon) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;
    const data = await safeFetchJSON(url);

    if (!data?.current_weather) throw new Error("No current_weather data");

    const condition = data.current_weather.weathercode;
    const temperature = data.current_weather.temperature;

    // Map numeric codes to readable conditions
    const conditionMap = {
      0: "Clear",
      1: "Clear",
      2: "Cloudy",
      3: "Cloudy",
      45: "Fog",
      48: "Fog",
      51: "Rain",
      61: "Rain",
      63: "Rain",
      65: "Rain",
      80: "Rain",
      95: "Thunderstorm",
      96: "Thunderstorm",
      99: "Thunderstorm",
      71: "Snow",
      73: "Snow",
      75: "Snow"
    };

    return {
      condition: conditionMap[condition] || "Clear",
      temperature
    };

  } catch (err) {
    console.warn("Weather fetch failed, using default:", err);
    return { condition: "Clear", temperature: 20 };
  }
}

export async function inferTerrain(lat, lon) {
    if (lat < -60) return "tundra";
    if (lat > 60) return "taiga";
    if (lat < 10 && lat > -10) return "desert";
    if (lat >= 10 && lat <= 50) return "temperate-plains";
    return "plains";
}

export async function isForest(lat, lon, radius = 500) {
    const query = `
        [out:json];
        (
            way["natural"="wood"](around:${radius},${lat},${lon});
            relation["natural"="wood"](around:${radius},${lat},${lon});
        );
        out count;
    `;
    const url = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query);
    const res = await safeFetchJSON(url);
    const count = res.elements?.[0]?.tags?.total || 0;
    return count > 0;
}


async function getTrueRandomIndex(max) {
    try {
        const response = await fetch(
            `https://www.random.org/integers/?num=1&min=0&max=${max - 1}&col=1&base=10&format=plain&rnd=new`
        );
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
    let character = getCharacter(); 
    // 1. Get player coordinates
    const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
    );
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    setVariable('location', `${lat},${lon}`);

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

    // 3. Refine with micro-terrain if Wild
    if(eventZone === 'Wild') {
        terrainType = await inferTerrain(lat, lon); // macro-biome by lat/lon
        const forest = await isForest(lat, lon); 
        if(forest) terrainType = "Forest";
    }

    setVariable('terrainType', terrainType);

    // 5. Get current weather
    const weather = await getWeather(lat, lon); // e.g., { condition: "Rain", time: "Night" }

    setVariable('weather', weather);

    // 6. Select JSON event
    let jsonBranch;
    try {
        jsonBranch = getStoryboardBranch(character.class, terrainType, weather.condition);
    } catch (err) {
        console.warn("Falling back to default storyboard events:", err);
        jsonBranch = { Event_1: { description: "Nothing here yet." }, Event_2: { description: "Still nothing." } };
    }

    // Randomly pick an event
    const eventKeys = Object.keys(jsonBranch);
    const randomIndex = await getTrueRandomIndex(eventKeys.length);
    const selectedEventKey = eventKeys[randomIndex];
    const eventData = jsonBranch[selectedEventKey];
    character.lastEvent = eventData;
    setCharacter(character);
    setVariable('class', character.class);


    // 7. Return event data to render in DOM
    return {
        eventZone,
        terrainType,
        weather,
        event: eventData
    };
}

export async function safeFetchJSON(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.warn("Non-JSON response:", text.slice(0, 200));
        throw new Error("Expected JSON but got non-JSON response");
    }

    return response.json();
}

function getStoryboardBranch(characterClass, biome, weather) {
    const classBranch = storyboard[characterClass];
    if (!classBranch) throw new Error(`No storyboard for class ${characterClass}`);

    const biomeBranch = classBranch[biome] || classBranch["Urban"] || Object.values(classBranch)[0];
    // fallback to Urban or first available biome if biome doesn't exist

    const weatherBranch = biomeBranch[weather] || biomeBranch["Clear"] || Object.values(biomeBranch)[0];
    // fallback to Clear or first available weather if missing

    return weatherBranch;
}
