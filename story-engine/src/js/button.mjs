document.addEventListener('DOMContentLoaded', () => {
    const menuButt = document.getElementById('menu-button');
    const charButt = document.getElementById('char-button');
    const exitButt = document.getElementById('exit-button');

    if (menuButt) {
        menuButt.addEventListener('click', () => {
            window.open('/menu/index.html');
        });
    }

    if (charButt) {
        charButt.addEventListener('click', () => {
            window.open('/character/index.html');
        });
    }

    if (exitButt) {
        exitButt.addEventListener('click', () => {
            if (confirm('Exiting will lose any unsaved progress, continue?')) {
                window.location.href = '/index.html';
            }
        });
    }
});
