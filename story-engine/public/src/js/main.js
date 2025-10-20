import { getCharacter, clearCharacter } from './state.mjs';
import { renderEventWindow, renderOptionsWindow, renderEvent } from './render.mjs';

const character = getCharacter();

if (!character) { 
    renderEventWindow({
        image: '/assets/images/default',
        text: 'The mists of Darkness always encircle you, let the light of your choices, the fruits of your labor, guide you through. Embark on a journey of decision and adventure.',
        animate: true
    });

    renderOptionsWindow([
        {
            label: 'Generate New Character',
            onClick: () => {
                window.location.href = '/character/index.html';
            }
        }
    ]);
} else {
    renderEvent(character.lastEvent)

    renderOptionsWindow([
        {
            label: 'Continue',
            onClick: async () => {
                window.location.href = './story/index.html';
            }
        },
        {
            label: 'Generate New Character',
            onClick: () => {
                const confirmDelete = confirm(
                    "Performing this action will delete your previous saved character. Continue to New Character Creation?"
                );
                if (confirmDelete) {
                    clearCharacter();
                    window.location.href = './character/index.html';
                }
            }
        }
    ]);
}