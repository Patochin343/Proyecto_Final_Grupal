// Espera a que todo el contenido HTML esté cargado
document.addEventListener('DOMContentLoaded', function() {

    //LÓGICA PARA: reserva.html
    
    // Busca el formulario de reserva
    const formReserva = document.querySelector('.reserva-form-container form');
    if (formReserva) {
        
        // 1. Autocompletar la cancha desde la URL
        const urlParams = new URLSearchParams(window.location.search);
        const canchaSeleccionada = urlParams.get('cancha');
        
        if (canchaSeleccionada) {
            const selectCancha = document.getElementById('cancha-seleccionada');
            if (selectCancha) {
                selectCancha.value = canchaSeleccionada;
            }
        }

        // 2. Evitar que se puedan reservar fechas pasadas
        const inputFecha = document.getElementById('fecha');
        if (inputFecha) {
            // Obtiene la fecha de hoy en formato AAAA-MM-DD
            const hoy = new Date().toISOString().split('T')[0];
            inputFecha.setAttribute('min', hoy);
        }

        // 3. Manejar el envío del formulario (simulación)
        formReserva.addEventListener('submit', function(evento) {
            evento.preventDefault(); // Evita que la página se recargue

            // Aquí puedes agregar validaciones más complejas
            const nombre = document.getElementById('nombre').value;
            const fecha = document.getElementById('fecha').value;
            const hora = document.getElementById('hora').value;

            if (nombre && fecha && hora) {
                // Simulación de éxito
                alert(`¡Reserva confirmada, ${nombre}!\nCancha: ${canchaSeleccionada}\nFecha: ${fecha} a las ${hora}`);
                formReserva.reset(); // Limpia el formulario
            } else {
                alert('Por favor, completa todos los campos.');
            }
        });
    }

    // Busca el formulario de contacto
    const formContacto = document.querySelector('.contact-form form');
    if (formContacto) {
        formContacto.addEventListener('submit', function(evento) {
            evento.preventDefault();
            
            const mensaje = document.getElementById('mensaje').value;
            
            if (mensaje.trim() === '') {
                alert('Por favor, escribe un mensaje.');
            } else {
                // Simulación de éxito
                alert('¡Mensaje enviado! Gracias por contactarnos.');
                formContacto.reset();
            }
        });
    }

    //LÓGICA PARA: login.html

    // Busca el formulario de login
    const formLogin = document.querySelector('.login-container form');
    if (formLogin) {
        formLogin.addEventListener('submit', function(evento) {
            evento.preventDefault();
            
            const usuario = document.getElementById('usuario').value;
            
            if (usuario) {
                 // Simulación de éxito
                alert(`¡Bienvenido de nuevo, ${usuario}!`);
                formLogin.reset();
            } else {
                alert('Por favor, ingresa tu usuario.');
            }
        });
    }

});