// Establecer fecha actual en el campo de fecha
document.getElementById('fecha').valueAsDate = new Date();
let medicamentoSeleccionadoID = null;

async function cargarTablaCarrito() {
    try {
        const res = await fetch('/api/getCart');
        if (!res.ok) throw new Error('Error al obtener el carrito');
        const carrito = await res.json();

        const tbody = document.querySelector('#tablaMedicamentos tbody');
        tbody.innerHTML = ''; // Limpiar tabla

        carrito.forEach((item, index) => {
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td class="text-center">${index + 1}</td>
                <td class="text-center">${item.Clasificacion}</td>
                <td class="text-center"> ${item.Presentacion}</td>
                <td>${item.Sustancia_activa}</td>
                <td class="text-center">${item.Cantidad_Sum}</td>
                <td class="text-center">${new Date(item.Fecha_caducidad).toLocaleDateString()}</td>
                <td class="text-center">
                    <button class="btn btn-danger btn-sm btn-delete-p" data-id="${item.ProductoID}">
                    Eliminar
                    </button>
                </td>
            `;

            tbody.appendChild(tr);
        });
        document.querySelectorAll('.btn-delete-p').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                try {
                    const res = await fetch(`/api/deleteProductCart/${id}`, {
                        method: 'POST'
                    });
                    const data = await res.json();
                    if (data.ok) {
                        alert(data.message);
                        cargarTablaCarrito(); // 🔄 refrescar tabla
                    } else {
                        alert('Error al eliminar producto');
                    }
                } catch (err) {
                    console.error('Error en la petición:', err);
                    alert('Error de conexión con el servidor');
                }
            });
        });

    } catch (err) {
        console.error('Error al cargar tabla:', err);
    }
}

// Llamar al cargar la página
window.addEventListener('DOMContentLoaded', cargarTablaCarrito);

// Filtro en vivo
document.getElementById('buscarMedicamento').addEventListener('input', async (e) => {
    const q = e.target.value.trim();
    if (q.length < 2) return;

    try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error('Error en búsqueda');
        const medicamentos = await res.json();

        const results = document.getElementById('resultadosSearch');
        results.innerHTML = '';

        const optiondefault = document.createElement('option');
        optiondefault.textContent = 'Selecciona un medicamento';
        optiondefault.disabled = true;
        optiondefault.selected = true;
        results.appendChild(optiondefault);

        medicamentos.forEach(med => {
            // Calcular diferencia en meses
            const fecha = new Date(med.Fecha_caducidad); // usa directamente la fecha del objeto
            const visualDate= fecha.toLocaleDateString();
            const fechaActual = new Date();
            const diff = fecha - fechaActual; // diferencia en ms
            const diffMeses = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));

            // Crear opción
            const option = document.createElement('option');
            option.value = med.ProductoID;
            option.textContent = `${med.Sustancia_activa} (${med.Presentacion})`;
            option.dataset.nombre = med.Nombre;

            // Colorear según caducidad
            if (diffMeses > 11) {
                option.textContent = `🟢[${visualDate}] | ${med.Sustancia_activa} (${med.Presentacion})`;
            } else if (diffMeses >= 1) {
                option.textContent = `🟡[${visualDate}] ${med.Sustancia_activa} (${med.Presentacion})`;
            } else {
                option.textContent = `🔴[${visualDate}] ${med.Sustancia_activa} (${med.Presentacion})`;
            }

            option.addEventListener('click', () => {
                medicamentoSeleccionado = med;
            });

            results.appendChild(option);
        }
    );
    } catch (err) {
        console.error(err);
    }
});

// Escucha el cambio en el select para guardar el ID
document.getElementById('resultadosSearch').addEventListener('change', (e) => {
    medicamentoSeleccionadoID = e.target.value;
});


document.getElementById('add-to-cart-btn').addEventListener('click', async () => {
    const cantidadInput = document.getElementById('cantidadMedicamento');
    const cantidad = parseInt(cantidadInput.value);
    if (!medicamentoSeleccionadoID) {
        alert('Selecciona un medicamento primero');
        return;
    }
    if (isNaN(cantidad) || cantidad <= 0) {
        alert('Ingresa una cantidad válida');
        return;
    }
    try {
        const res = await fetch(`/api/addproductcart/${medicamentoSeleccionadoID}/${cantidad}`, {
            method: 'POST'
        });
        const data = await res.json();
        if (data.ok) {
            alert(data.message);
            cargarTablaCarrito(); // 🔄 refrescar tabla
        } else {
            alert('Error al agregar al carrito');
        }
    } catch (err) {
        console.error(err);
        alert('Error de conexión con el servidor');
    }
});

const checkbox = document.getElementById('nointerno');
const nuaInput = document.getElementById('NUA');
checkbox.addEventListener('change', function() {
    if (this.checked) {
        nuaInput.value = '000000';
        nuaInput.readOnly = true;
    } else {
        nuaInput.value = '';
        nuaInput.readOnly = false;
    }
});


const resetBtn = document.getElementById('reset-form-btn');
const form = document.getElementById('atencion-Form');
if (resetBtn && form) {
    resetBtn.addEventListener('click', async () => {
        if (!confirm('¿Seguro que quieres cancelar la atención?')) return;
        try{
            const res = await fetch(`/api/resetCart`, {
            method: 'POST'
        });
            const data = await res.json();
            if(data.ok) {
                alert(data.message);
                form.reset();
                document.getElementById('fecha').valueAsDate = new Date();
                cargarTablaCarrito();
            }else{
                alert('Error al cancelar la atención');
            }
        }catch (e){
            console.error(e);
            alert('Error de conexión con el servidor');
        }
    })}

const finalizarBtn = document.getElementById('send-atention-btn');
if (finalizarBtn && form) {
    finalizarBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const NUA = document.getElementById('NUA').value.trim();
        const nombre = document.getElementById('nombre').value.trim();
        const apellidoP = document.getElementById('apellidoP').value.trim();
        const apellidoM = document.getElementById('apellidoM').value.trim();
        const diagnostico = document.getElementById('diagnostico').value.trim();

        try {
            const res = await fetch('/api/finalizar-atencion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ NUA, nombre, apellidoP, apellidoM, diagnostico })
            });
            const data = await res.json();
            if (data.ok) {
                alert('Atención finalizada con éxito');
                form.reset();
                document.getElementById('fecha').valueAsDate = new Date();
                cargarTablaCarrito();
            } else {
                alert('Error al finalizar la atención: ' + (data.error || 'Error desconocido'));
            }
        } catch (err) {
            console.error('Error al finalizar atención:', err);
            alert('Error de conexión con el servidor');
        }
    }
    )
}
