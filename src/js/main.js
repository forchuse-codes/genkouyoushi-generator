import {Grid} from './Grid.js'

// Generate grid on page load with defaults
(() => {
    const grid = new Grid();

    const help_buttons = document.querySelectorAll('.section-help');
    help_buttons.forEach((button) => {
        const dialog = document.getElementById(button.getAttribute('aria-controls'));
        button.addEventListener('click', () => {
            dialog.showModal();
        });

        const close_button = dialog.querySelector('.close-help');
        close_button.addEventListener('click', () => {
            close_button.closest('dialog').close();
        });
    });

    const config = document.getElementById("configuration");
    const unit_btns = document.querySelectorAll(".btn-group > button");
    unit_btns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('selected')) return;
            unit_btns.forEach(btn => btn.classList.remove('selected'));
            btn.classList.add('selected');

            const abbrv = btn.dataset.abbrv;
            config.setAttribute('data-units', abbrv)
            grid.switchUnits(abbrv);
            grid.updatePresetText();
        });
    });
})()