import {Grid} from './Grid.js'

// Generate grid on page load with defaults
(() => {
    const grid = new Grid();

    function updatePresetText() {
        for (let i = 0; i < presets.options.length; i++) {
            const option = presets.options[i];
    
            if (option.value === "custom") continue;
    
            const abbrv = grid.units.currentAbbrv;
            option.innerText = `${option.value} (${option.dataset[abbrv+"X"]} x ${option.dataset[abbrv+"Y"]})`;
        }
    }

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
            updatePresetText();
        });
    })

    const width   = document.getElementById('page-width');
    const height  = document.getElementById('page-height');
    const presets = document.getElementById('presets');
    presets.addEventListener('change', (e) => {
        const selected = e.target.options[e.target.selectedIndex];

        if (selected.value === "custom") return;
        
        const abbrv = grid.units.currentAbbrv;
        const x = parseFloat(selected.dataset[abbrv+"X"]);
        const y = parseFloat(selected.dataset[abbrv+"Y"]);
        const portrait = grid.isPortrait();

        width.value  = portrait ? x : y;
        height.value = portrait ? y : x;
        grid.refreshPreview();
    });

    updatePresetText();
})()