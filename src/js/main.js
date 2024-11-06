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
    const unit_labels = document.querySelectorAll('input[name="units"]+label');
    const units = [];
    unit_labels.forEach(btn => {
        const input = document.getElementById(btn.getAttribute('for'));
        units.push({
            label: btn,
            input: input
        });
    });    

    const units_list = document.getElementById('units');
    units_list.addEventListener('mouseup', (e) => {
        units.forEach((unit) => {
            const abbrv = unit.input.dataset.abbrv;
            const unit_class = "units-" + abbrv;

            if (e.target === unit.label) {
                if (grid.units.currentAbbrv === abbrv) return;
                grid.switchUnits(abbrv);
                config.classList.add(unit_class);
                updatePresetText();
            }
            else {
                config.classList.remove(unit_class);
            }
            
        });
    });

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