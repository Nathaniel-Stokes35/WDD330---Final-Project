import { getCharacter, setVariable } from "./state.mjs";

export function renderEventWindow({ image, text, animate = false }) {
    const eventWindow = document.querySelector('.event-window');
    eventWindow.innerHTML = '';

    // Reset active state to trigger CSS transition
    eventWindow.classList.remove('active');
    void eventWindow.offsetWidth; // reflow trick
    eventWindow.classList.add('active');

    // Set background directly on eventWindow for simplicity
    const resolution = getBestResolution();
    setVariable('resolution', resolution);

    const imageUrl = `${image}/${resolution}.webp`;
    eventWindow.style.backgroundImage = `url('${imageUrl}')`;

    if (animate) {
        eventWindow.style.animation = 'panBackground 20s linear infinite alternate';
    } else {
        eventWindow.style.animation = 'none';
    }

    const overlay = document.createElement('span');
    overlay.textContent = text;

    eventWindow.appendChild(overlay);

    // Animate overlay in
    requestAnimationFrame(() => {
        overlay.style.opacity = 1;
        overlay.style.transform = 'translateX(-50%) translateY(0)';
    });
}

export function renderOptionsWindow(options) {
    const optionsWindow = document.querySelector('.options-window');
    optionsWindow.innerHTML = '<h2 id="options-heading">What will you do?</h2>';

    options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.textContent = opt.label;
        btn.addEventListener('click', opt.onClick);
        optionsWindow.appendChild(btn);

        setTimeout(() => btn.classList.add('show'), i * 150);
    });
}

export function renderEvent (event, newImage, pass=true, descUpdate) {
    const animate = event.animate ?? true;
    let newText = '';

    if (pass) {
        if (descUpdate != '') {
            newText = event.description;
        }
        else {
            newText = `${descUpdate} ${event.description}`;
        }
        renderEventWindow({
            image: event.image,
            text: newText,
            animate
        });

        renderOptionsWindow(event.choices ?? []);
    }
    else {
        const character = getCharacter();
        if (descUpdate != '') {
            newText = event.timeoutResponse;
        }
        else {
            newText = `${descUpdate} ${event.timeoutResponse}`;
        } 
        renderEventWindow({
            image: newImage,
            text: newText,
            animate
        });
        renderOptionsWindow([
            {
                label: 'Start New Adventure',
                onClick: () => {
                    character.lastEvent = null;
                    window.location.href = '/story/index.html';
                }
            }
        ]);
    }
}

function getBestResolution() {
    const width = window.innerWidth;
    if (width > 2559) return 2560;
    else if (width > 1919) return 1920;
    else if (width > 1439) return 1440;
    else if (width > 1023) return 1024;
    else if (width > 767) return 768;
    else return 480;
}