async function cargarNotificaciones() {
    try {
        const res = await fetch('/api/getNotifications', {method: 'GET'});
        const data = await res.json();
        const notificacionesContainer = document.getElementById('notification-center');
        const notificacionesCount = document.getElementById('notification-count');
        notificacionesContainer.innerHTML = ''; // Limpiar notificaciones previas
        if (data.length === 0) {
            notificacionesContainer.innerHTML = '<p class="text-center fw-normal">No hay notificaciones</p>';
            notificacionesCount.innerHTML = '0';
            return;
        }else{
            if(data.length>0){
                notificacionesCount.innerHTML = data.length;
                data.forEach(notify => {
                    const a = document.createElement('a');
                    a.href = '#';
                    a.className = 'list-group-item list-group-item-action mb-1 border border-2';
                    if (notify.CODE === 1) {
                        a.style.backgroundColor = 'rgba(255,204,0,0.18)';
                    } else if (notify.CODE === 0) {
                        a.style.backgroundColor = 'rgba(255,0,0,0.09)';
                    }
                    const div = document.createElement('div');
                    div.className = 'd-flex w-100 justify-content-between fw-normal';
                    const p = document.createElement('p');
                    p.className = 'mb-1';
                    // SET TYPE OF NOTIFICATION
                    if(notify.CODE === 1){
                        p.innerHTML = `<i class="bi bi-clock-history"></i> Notificación`;
                    }else if(notify.CODE === 0){
                        p.innerHTML = `<i class="bi bi-capsule-pill"></i> Alerta`;
                    }
                    const smallTime = document.createElement('small');
                    smallTime.className = 'text-muted fw-normal';
                    smallTime.innerText = 'Ahora';
                    div.appendChild(p);
                    div.appendChild(smallTime);
                    const smallMsg = document.createElement('small');
                    smallMsg.className = 'mb-1 fw-semibold';
                    const fechaObj = new Date(notify.Fecha_caducidad);
                    const fecha = fechaObj.toISOString().split('T')[0];
                    const [year, month, day] = fecha.split('-');
                    const fechaFormateada = `${day}/${month}/${year}`;
                    if(notify.CODE === 1){
                        smallMsg.innerText = "El producto [" + cutText(notify.Sustancia_activa , 30) + "]  caducará el [" + fechaFormateada + "].";
                    }else if(notify.CODE === 0){
                        smallMsg.innerText = "El producto [" + cutText(notify.Sustancia_activa , 30) + "] caducó el [" + fechaFormateada + "].";
                    }
                    a.appendChild(div);
                    a.appendChild(smallMsg);
                    notificacionesContainer.appendChild(a);
                });
            }
        }
    }catch(error) {
        console.error('Error al cargar notificaciones:', error);
    };
};
function cutText(texto, longitud) {
    if (texto.length > longitud) {
        return texto.substring(0, longitud) + "...";
    }
    return texto;
}



window.addEventListener('DOMContentLoaded', cargarNotificaciones);