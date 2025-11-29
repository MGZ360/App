// Manejar la generación de reporte PDF
document.getElementById('btnConfirmGeneratePDF').addEventListener('click', async function() {
    const reportName = document.getElementById('nombreReportePDF').value.trim();
    
    if (!reportName) {
        alert('Por favor, ingrese un nombre para el reporte');
        return;
    }

    // Validar que el usuario no haya incluido extensión
    const sanitizedName = reportName.replace(/\.(pdf|xlsx|xls|doc|docx)$/i, '');
    
    // Deshabilitar el botón mientras se procesa
    const btn = this;
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generando...';

    try {
        const response = await fetch('/api/reports/generate-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reportName: sanitizedName })
        });

        const data = await response.json();

        if (data.success) {
            // Cerrar el modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalGeneratePDF'));
            modal.hide();
            
            // Limpiar el input
            document.getElementById('nombreReportePDF').value = '';
            
            // Mostrar mensaje de éxito
            showNotification('Reporte PDF generado exitosamente', 'success');
            
            // Recargar la página para mostrar el nuevo reporte
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            showNotification(data.message || 'Error al generar el reporte PDF', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error de conexión al generar el reporte', 'error');
    } finally {
        // Rehabilitar el botón
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
});

// Manejar la generación de reporte Excel
document.getElementById('btnConfirmGenerateExcel').addEventListener('click', async function() {
    const reportName = document.getElementById('nombreReporteExcel').value.trim();
    
    if (!reportName) {
        alert('Por favor, ingrese un nombre para el reporte');
        return;
    }

    // Validar que el usuario no haya incluido extensión
    const sanitizedName = reportName.replace(/\.(pdf|xlsx|xls|doc|docx)$/i, '');
    
    // Deshabilitar el botón mientras se procesa
    const btn = this;
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generando...';

    try {
        const response = await fetch('/api/reports/generate-excel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reportName: sanitizedName })
        });

        const data = await response.json();

        if (data.success) {
            // Cerrar el modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalGenerateExcel'));
            modal.hide();
            
            // Limpiar el input
            document.getElementById('nombreReporteExcel').value = '';
            
            // Mostrar mensaje de éxito
            showNotification('Reporte Excel generado exitosamente', 'success');
            
            // Recargar la página para mostrar el nuevo reporte
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            showNotification(data.message || 'Error al generar el reporte Excel', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error de conexión al generar el reporte', 'error');
    } finally {
        // Rehabilitar el botón
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
});

// Manejar la descarga de reportes
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('download-report-btn') || 
        e.target.closest('.download-report-btn')) {
        
        const btn = e.target.classList.contains('download-report-btn') 
            ? e.target 
            : e.target.closest('.download-report-btn');
        
        const reportId = btn.getAttribute('data-report-id');
        
        if (reportId) {
            // Abrir la URL de descarga en una nueva ventana
            window.location.href = `/api/reports/download/${reportId}`;
        }
    }
});

// Función auxiliar para mostrar notificaciones
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Validar nombre del reporte en tiempo real (evitar caracteres especiales peligrosos)
document.getElementById('nombreReportePDF').addEventListener('input', function(e) {
    // Remover caracteres especiales peligrosos pero permitir espacios, guiones y letras con acentos
    this.value = this.value.replace(/[<>:"/\\|?*]/g, '');
});

document.getElementById('nombreReporteExcel').addEventListener('input', function(e) {
    // Remover caracteres especiales peligrosos pero permitir espacios, guiones y letras con acentos
    this.value = this.value.replace(/[<>:"/\\|?*]/g, '');
});

// Prevenir que se cierre el modal al presionar Enter en los inputs
document.getElementById('nombreReportePDF').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('btnConfirmGeneratePDF').click();
    }
});

document.getElementById('nombreReporteExcel').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('btnConfirmGenerateExcel').click();
    }
});

// Limpiar formularios al cerrar modales
document.getElementById('modalGeneratePDF').addEventListener('hidden.bs.modal', function () {
    document.getElementById('nombreReportePDF').value = '';
});

document.getElementById('modalGenerateExcel').addEventListener('hidden.bs.modal', function () {
    document.getElementById('nombreReporteExcel').value = '';
});
