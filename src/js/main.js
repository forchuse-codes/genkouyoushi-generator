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

    const vocabList = document.getElementById("vocab-list");
    const addWord = document.getElementById("add-word");
    addWord.addEventListener('click', () => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('word-wrapper');

        const input = document.createElement('input');
        const id    = "word-" + document.querySelectorAll('.word').length;
        input.type  = "number";
        input.class = "word";
        input.min   = 1;
        input.value = Math.round(Math.random() * (5 - 1) + 1);
        input.id    = id;

        wrapper.appendChild(input);

        const label = document.createElement('label');
        label.for   = id;
        label.innerText = "characters";

        wrapper.appendChild(label);

        const deleteBtn = document.createElement('button');
        deleteBtn.title = "Remove word";
        deleteBtn.innerText = '-';
        deleteBtn.addEventListener('click', () => {
            vocabList.removeChild(wrapper);
        });

        wrapper.appendChild(deleteBtn);

        vocabList.appendChild(wrapper);
    });
})()