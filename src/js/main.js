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
    const unit_btns = document.querySelectorAll("#units > button");
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

    const vocabSection = document.getElementById('vocab-section');
    const vocabList = document.getElementById("vocab-list");
    const addWord = document.getElementById("add-word");
    addWord.addEventListener('click', () => {
        vocabSection.classList.remove('empty');

        const wrapper = document.createElement('div');
        wrapper.classList.add('word-wrapper');

        const input = document.createElement('input');
        const id    = "word-" + document.querySelectorAll('.word').length;
        input.type  = "number";
        input.class = "word";
        input.min   = 1;
        // input.value = Math.round(Math.random() * (5 - 1) + 1);
        input.value = 1;
        input.id    = id;

        wrapper.appendChild(input);

        const label = document.createElement('label');
        label.for   = id;
        label.innerText = "Characters";
        label.classList.add('visually-hidden');

        wrapper.appendChild(label);

        const deleteBtn = document.createElement('button');
        deleteBtn.title = "Remove word";
        deleteBtn.innerText = '-';
        deleteBtn.addEventListener('click', () => {
            vocabList.removeChild(wrapper);

            if (!vocabList.children.length) vocabSection.classList.add('empty');
            else vocabSection.classList.remove('empty');
        });

        wrapper.appendChild(deleteBtn);

        vocabList.appendChild(wrapper);
    });
})()