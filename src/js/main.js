import {Grid} from './Grid.js'
  
// Generate grid on page load with defaults
(() => {
    const grid = new Grid()

    const help_buttons = document.querySelectorAll('.section-help');
    help_buttons.forEach((button) => {
        const dialog = document.getElementById(button.getAttribute('aria-controls'));
        button.addEventListener('click', () => {
            dialog.showModal();
        })

        const close_button = dialog.querySelector('.close-help');
        close_button.addEventListener('click', () => {
            close_button.closest('dialog').close();
        })
    })
})()