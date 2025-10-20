import { setCharacter, getCharacter, clearCharacter, setVariable } from './state.mjs';
import { renderOptionsWindow } from './render.mjs';
import { generateScenario, loadJSON } from './utils.mjs';

console.log("Character module loaded... PASS");

document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOMContentLoaded... PASS");

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const baseAttributes = { str: 0, end: 0, dex: 0, agi: 0, int: 0, wis: 0 };
        const name = document.getElementById('charName').value.trim();
        const cls = classes.find(c => c.id === document.getElementById('charClass').value);
        const bg = backgrounds.find(b => b.id === document.getElementById('charBackground').value);
        const pr = principles.find(p => p.id === document.getElementById('charPrinciple').value);
        const lastEvent = await generateScenario();

        // Apply background attributes
        bg.att.forEach(attr => {
            if (baseAttributes.hasOwnProperty(attr)) baseAttributes[attr] += 1;
        });

        const summarySentence = `You are a ${cls.name}. ${cls.description} You were a ${bg.name}. ${bg.description} You are guided by ${pr.left} versus ${pr.right}: ${pr.description}`;

        if (confirm(`You wish to be:\n\n${summarySentence}`)) {
            const newChar = {
                name,
                class: cls.id,
                background: bg.id,
                principle: pr.id,
                summary: summarySentence,
                level: 1,
                lastEvent: lastEvent,
                attributes: baseAttributes
            };

            setCharacter(newChar);
            setVariable('background', bg);
            setVariable('principle', pr);
            setVariable('level', 1);

            renderSummary(newChar);
        }
    });

    // Render character summary and options
    function renderSummary(character) {
        form.classList.add('hidden');
        summary.classList.remove('hidden');
        summaryText.textContent = character.summary;

        renderOptionsWindow([
            {
                label: 'Continue',
                onClick: () => window.location.href = '/story/index.html'
            },
            {
                label: 'New Character',
                onClick: () => {
                    if (confirm('Delete this character?')) {
                        clearCharacter();
                        window.location.reload();
                    }
                }
            }
        ]);
    }
});

loadForm();

async function loadForm() {
    const character = getCharacter();

    // Load all JSON data
    const classes = await loadJSON('/assets/data/classes.json');
    const backgrounds = await loadJSON('/assets/data/backgrounds.json');
    const principles = await loadJSON('/assets/data/principles.json');

    // Populate selects    // Grab DOM elements
    const form = document.getElementById('characterForm');
    const summary = document.getElementById('characterSummary');
    const summaryText = document.getElementById('summaryText');

    if (!form || !summary || !summaryText) {
        console.error("Missing DOM elements for character creation!");
        return;
    }

    // If a character already exists, show summary
    if (character) {
        renderSummary(character);
        return;
    }

    // Populate dropdown selects
    populateSelect('charClass', classes);
    populateSelect('charBackground', backgrounds);
    populateSelect('charPrinciple', principles.map(p => ({ id: p.id, name: `${p.left} / ${p.right}` })));

    // Helper: populate a <select> with data
    function populateSelect(id, data) {
        const select = document.getElementById(id);
        if (!select) return;
        select.innerHTML = data.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    }
}
