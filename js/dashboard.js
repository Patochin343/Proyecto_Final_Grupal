document.addEventListener('DOMContentLoaded', function() {
    
    // 1. SI ESTAMOS EN ADMIN: CARGAR EMPLEADOS Y RESERVAS
    if (document.getElementById('tabla-empleados')) {
        cargarEmpleados();
        cargarReservas('tabla-reservas', false); // false = sin botón confirmar
    }

    // 2. SI ESTAMOS EN EMPLEADO: CARGAR SOLO RESERVAS CON ACCIÓN
    if (document.getElementById('tabla-reservas-empleado')) {
        cargarReservas('tabla-reservas-empleado', true); // true = con botón confirmar
    }

    // --- FUNCIONES ---

    function cargarEmpleados() {
        fetch('/api/empleados')
            .then(res => res.json())
            .then(data => {
                const tbody = document.querySelector('#tabla-empleados tbody');
                tbody.innerHTML = '';
                data.forEach(emp => {
                    tbody.innerHTML += `
                        <tr>
                            <td>${emp.nombre}</td>
                            <td>${emp.email}</td>
                            <td>
                                <button onclick="eliminarEmpleado('${emp.email}')" class="btn-danger">Eliminar</button>
                            </td>
                        </tr>
                    `;
                });
            });
    }

    function cargarReservas(tablaId, esEmpleado) {
        fetch('/api/reservas')
            .then(res => res.json())
            .then(data => {
                const tbody = document.querySelector(`#${tablaId} tbody`);
                tbody.innerHTML = '';
                data.forEach(res => {
                    let estadoHtml = res.estado === 'confirmada' 
                        ? '<span class="badge-ok">Confirmada</span>' 
                        : '<span class="badge-pending">Pendiente</span>';

                    let accionHtml = '';
                    if (esEmpleado && res.estado !== 'confirmada') {
                        accionHtml = `<button onclick="confirmarReserva(${res.id})" class="btn-confirm">Confirmar ✅</button>`;
                    }

                    tbody.innerHTML += `
                        <tr>
                            <td>#${res.id}</td>
                            <td>${res.nombre}<br><small>${res.email}</small></td>
                            <td>${res.cancha_id}</td>
                            <td>${res.fecha} <br> ${res.hora}</td>
                            <td>${estadoHtml}</td>
                            ${esEmpleado ? `<td>${accionHtml}</td>` : ''} 
                            ${!esEmpleado ? '' : ''} 
                        </tr>
                    `;
                });
            });
    }
});

// FUNCIONES GLOBALES (Para que funcionen los onclick)
function eliminarEmpleado(email) {
    if(!confirm('¿Seguro que deseas despedir a este empleado?')) return;

    fetch('/api/admin/del_empleado', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email: email })
    }).then(() => location.reload()); // Recargar página
}

function confirmarReserva(id) {
    fetch('/api/reservas/confirmar', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ id: id })
    }).then(() => location.reload());
}