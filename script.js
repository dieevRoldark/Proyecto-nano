
/*const boton = document.querySelector ('#open-menu')

boton.addEventListener('click', ()=> {
    boton.getElementById.checked = false;
})*/

/*  // 1. Seleccionamos todos los enlaces dentro del menú
  const menuLinks = document.querySelectorAll('.header__nav-list a');
  
  // 2. Seleccionamos el checkbox
  const checkbox = document.getElementById('#open-menu');

  // 3. A cada enlace le añadimos un "escucha" (listener)
  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      // Al hacer clic en un enlace, desmarcamos el checkbox
      checkbox.checked = false;
    });
  }); */

const menuLinks = document.querySelector('#link')

const boton = document.querySelector('#open-menu')


menuLinks.forEach(event => {
    event.addEventListener('click', () => {
        boton.checked = false;
    })
    
});