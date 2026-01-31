// DOCUMENTACION
/*addEventListener('change', ...): Usamos el evento change en lugar de click porque es más preciso para elementos de formulario como checkboxes. Se dispara justo cuando el valor cambia.

Manipulación del DOM: Usamos innerText para cambiar el contenido de texto dinámicamente sin recargar la página.

Inline Styles: Aunque podrías usar clases de CSS (que es más limpio), usar .style en JS es una forma directa y rápida de aprender cómo el lenguaje puede controlar cualquier propiedad visual del navegador.

Lógica Booleana: El if (statusSwitch.checked) evalúa si el switch está en la posición de "verdadero" (encendido) o "falso" (apagado).*/


// 1. Seleccionamos los elementos necesarios
const statusSwitch = document.getElementById('statusSwitch');
const statusText = document.getElementById('statusText');
const badgeStatus = document.getElementById('badgeStatus');
const badgeDot = document.getElementById('badgeDot');

// 2. Escuchamos el evento 'change' (cuando se hace clic)
statusSwitch.addEventListener('change', () => {
    if (statusSwitch.checked) {
        // --- ESTADO ACTIVADO ---
        statusText.innerText = "ACTIVO";
        
        // Colores para Activo (Verde)
        badgeStatus.style.color = "#00ffaa";
        badgeStatus.style.borderColor = "rgba(0, 255, 170, 0.2)";
        badgeStatus.style.backgroundColor = "rgba(0, 255, 170, 0.1)";
        badgeDot.style.backgroundColor = "#00ffaa";
        badgeDot.style.boxShadow = "0 0 8px #00ffaa";
        
        console.log("El perfil ahora es visible.");
    } else {
        // --- ESTADO DESACTIVADO ---
        statusText.innerText = "INACTIVO";
        
        // Colores para Inactivo (Gris/Rojo sutil)
        badgeStatus.style.color = "#6c757d";
        badgeStatus.style.borderColor = "rgba(108, 117, 125, 0.2)";
        badgeStatus.style.backgroundColor = "rgba(108, 117, 125, 0.1)";
        badgeDot.style.backgroundColor = "#6c757d";
        badgeDot.style.boxShadow = "none";
        
        console.log("El perfil está oculto.");
    }
});


// --- LÓGICA DE SKILLS ---
const skillsContainer = document.getElementById('skillsContainer');
const inputSkill = document.getElementById('inputSkill');

inputSkill.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault(); // Evita que se recargue la página
        const skillValue = inputSkill.value.trim();
        
        if (skillValue !== "") {
            addSkill(skillValue);
            inputSkill.value = ""; // Limpiar input
        }
    }
});

function addSkill(name) {
    const span = document.createElement('span');
    span.classList.add('skill-tag');
    span.innerHTML = `${name} <i class="bi bi-x-lg" onclick="this.parentElement.remove()"></i>`;
    
    // Insertar antes del input para que el input siempre quede al final
    skillsContainer.insertBefore(span, inputSkill);
}

// --- LÓGICA DE EXPERIENCIA ---
const selectExp = document.getElementById('selectExperiencia');
selectExp.addEventListener('change', function() {
    console.log("Nueva experiencia seleccionada: " + this.value);
    // Aquí podrías actualizar otros textos en la pantalla basados en los años
});