

// Script for the CV button


const boton = document.querySelector('#cv-botton')

boton.addEventListener( 'click', function() {
    boton.classList.add("is-applied")
    boton.disabled = true
})



// Script for the menu toggle button

window.menu.addEventListener('click', () => {
    document.getElementById('open-menu').checked = true;
    

    }
);


// Script for the contact form

const form = document.querySelector('#contact-form');
