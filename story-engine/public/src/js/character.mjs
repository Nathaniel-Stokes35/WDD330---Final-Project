import { setCharacter, getCharacter, clearCharacter, setVariable } from './state.mjs';
import { renderOptionsWindow } from './render.mjs';
import { generateScenario, loadJSON } from './utils.mjs';

const classes = await loadJSON('/assets/data/classes.json');
const backgrounds = await loadJSON('/assets/data/backgrounds.json');
const principles = await loadJSON('/assets/data/principles.json');

document.addEventListener('DOMContentLoaded', () => {
    const character = getCharacter();

    const form = document.getElementById('characterForm');
    const summary = document.getElementById('characterSummary');
    const summaryText = document.getElementById('summaryText');

    if (character) {
        renderSummary(character);
        return;
    }

    // Populate dropdowns
    populateSelect('charClass', classes);
    populateSelect('charBackground', backgrounds);
    populateSelect('charPrinciple', principles.map(p => ({ id: p.id, name: `${p.left} / ${p.right}` })));

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const baseAttributes = {str: 0, end: 0, dex: 0, agi: 0, int: 0, wis: 0};
        const name = document.getElementById('charName').value.trim();
        const cls = classes.find(c => c.id === document.getElementById('charClass').value);
        const bg = backgrounds.find(b => b.id === document.getElementById('charBackground').value);
        const pr = principles.find(p => p.id === document.getElementById('charPrinciple').value);
        const lastEvent = generateScenario();

        const summarySentence = `You are a ${cls.name}. ${cls.description} You were a ${bg.name}. ${bg.description} You are guided by ${pr.left} versus ${pr.right}: ${pr.description}`;

        bg.att.forEach(attr => {
            baseAttributes[attr] += 1; // give +1 to each background-associated attribute
        });

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


  function populateSelect(id, data) {
    const select = document.getElementById(id);
    select.innerHTML = data.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
  }

  function renderSummary(character) {
    form.classList.add('hidden');
    summary.classList.remove('hidden');
    summaryText.textContent = character.summary;

    renderOptionsWindow([
        {
            label: 'Continue',
            onClick: () => {
                window.location.href = '/story/index.html';
            }
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