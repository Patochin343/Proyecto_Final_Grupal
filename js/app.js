document.addEventListener('DOMContentLoaded', function() {
    
    /* =========================================================
       1. GLOBAL: Menú Móvil y Header Scroll
       ========================================================= */
    
    const header = document.querySelector(".main-header");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });

    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.main-nav ul');

    if (menuToggle && navList) {
        menuToggle.addEventListener('click', () => {
            navList.classList.toggle('show');
            menuToggle.textContent = navList.classList.contains('show') ? '✕' : '☰';
        });
    }

    /* =========================================================
       2. LÓGICA VISUAL DE RESERVA (reserva.html)
       ========================================================= */
    // Nota: Ya no interceptamos el 'submit' para que Python reciba los datos.
    // Aquí solo hacemos cálculos visuales de precio.
    
    if (document.querySelector('.reserva-form-container')) { 
        
        const PRECIOS = {
            'f7-campin': { nombre: 'El Campín - Fútbol 7', precio: 50 },
            'basket-norte': { nombre: 'Complejo Norte - Basket', precio: 40 },
            'padel-center': { nombre: 'Padel Center', precio: 60 }
        };

        const selectCancha = document.getElementById('cancha-seleccionada');
        const inputFecha = document.getElementById('fecha');
        const summaryContent = document.getElementById('summary-content');

        // A. Autocompletar desde URL
        const urlParams = new URLSearchParams(window.location.search);
        const canchaUrl = urlParams.get('cancha');
        
        if (canchaUrl && selectCancha && PRECIOS[canchaUrl]) {
            selectCancha.value = canchaUrl;
        }

        // B. Restricción de fecha (No pasado)
        if (inputFecha) {
            const hoy = new Date().toISOString().split('T')[0];
            inputFecha.setAttribute('min', hoy);
        }

        // C. Calcular Precio en Tiempo Real
        function actualizarResumen() {
            // Si el elemento de resumen no existe en el HTML (porque no lo hemos puesto), no hacer nada
            if(!summaryContent) return;

            const canchaVal = selectCancha.value;
            const infoCancha = PRECIOS[canchaVal] || { nombre: 'Cancha', precio: 0 };
            
            summaryContent.innerHTML = `
                <div style="border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 10px;">
                    <p><strong>Cancha:</strong> ${infoCancha.nombre}</p>
                    <p><strong>Fecha:</strong> ${inputFecha.value || 'Pendiente'}</p>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 1.2rem;">
                    <span>Total a Pagar:</span>
                    <strong style="color: #ffeb3b;">$${infoCancha.precio}.00</strong>
                </div>
            `;
        }

        if (selectCancha) selectCancha.addEventListener('change', actualizarResumen);
        if (inputFecha) inputFecha.addEventListener('change', actualizarResumen);
        
        actualizarResumen();
    }
});
/* =========================================================
       4. MENSAJES DEL SERVIDOR (Alertas automáticas)
       ========================================================= */
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has('error')) {
        const errorType = urlParams.get('error');
        if (errorType === 'credenciales') alert('❌ Usuario o contraseña incorrectos.');
        if (errorType === 'existe') alert('⚠️ Este correo ya está registrado.');
    }

    if (urlParams.has('registrado')) {
        alert('✅ ¡Registro exitoso! Ahora puedes iniciar sesión.');
    }

    if (urlParams.has('reserva')) {
        alert('⚽ ¡Reserva confirmada! Te esperamos en la cancha.');
    }