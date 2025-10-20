import { getCharacter, getVariable } from './state.mjs';
import { renderEvent } from './render.mjs';
import { generateScenario } from './utils.mjs';

const character = getCharacter();
const startTime = new Date();
const scenarioData = await generateScenario(character.lastEvent);

async function initStory() {
    if (!character) {
        window.location.href = '/character/index.html';
        return;
    }

    renderEvent(scenarioData.event);
}

initStory();

window.addEventListener('focus', checkEventStatus);
window.addEventListener('click', checkEventStatus);

function checkEventStatus() {

    let weather = getVariable('weather').condition;
    console.log(weather);
    let terrainType =  getVariable('terrainType');

    const image = `assets/images/${terrainType}/${weather.condition}`;

    const now = new Date();
    const lastEventTime = new Date(startTime?.timestamp || now);
    const secondsPassed = (now - lastEventTime) / 1000;
    
    if (secondsPassed > scenarioData.timeout) {
        renderEvent(scenarioData.event, image, pass=false);
    }
    else {
        renderEvent(scenarioData.event, image);
    }
}