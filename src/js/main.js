import { generateScenario } from './utils';

let storyboard;

async function loadStoryboard() {
  const res = await fetch('/assets/storyboard.json'); 
  if (!res.ok) throw new Error('Failed to load storyboard');
  storyboard = await res.json();
}

await loadStoryboard();

function renderEvent(eventData) {
    const eventWindow = document.querySelector('.event-window');
    const optionsWindow = document.querySelector('.options-window');

    // Clear previous content
    eventWindow.innerHTML = '';
    optionsWindow.innerHTML = '';

    // Set the background image
    eventWindow.style.backgroundImage = `url('${eventData.image}')`;

    // Create text overlay
    const textBox = document.createElement('div');
    textBox.className = 'event-text';
    textBox.textContent = eventData.description || 'Something happens...';
    eventWindow.appendChild(textBox);

    // Create buttons for options
    if (eventData.options) {
        eventData.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.textContent = opt.label;
        btn.addEventListener('click', () => {
            if (opt.nextEventKey) {
            const nextEvent = storyboard[eventZone][opt.nextEventKey];
            renderEvent(nextEvent);
            }
        });
        optionsWindow.appendChild(btn);
        });
    }
}

generateScenario().then(scenarioData => {
    renderEvent(scenarioData.event);
});
