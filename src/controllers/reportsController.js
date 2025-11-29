import puppeteer from 'puppeteer';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const controller = {};

// Rutas importantes
const REPORTS_DIR = path.join(__dirname, '..', 'reports');
const TEMPLATE_PATH = path.join(__dirname, '..', 'templates', 'report-template.html');
const EXCEL_TEMPLATE_PATH = path.join(__dirname, '..', 'templates', 'report-excel-template.html');

// Asegurar que exista el directorio de reportes
if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// Función auxiliar para calcular el color del semáforo según la fecha de caducidad
const getExpirationColor = (fechaCaducidad) => {
    if (!fechaCaducidad) {
        return { color: '#6c757d', bgColor: '#6c757d', textColor: 'white', label: 'N/A' };
    }

    const fechaActual = new Date();
    const fechaP = new Date(fechaCaducidad);
    const diff = fechaP - fechaActual;
    const diffMeses = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));

    if (diffMeses > 11) {
        return { color: '#28a745', bgColor: '#28a745', textColor: 'white', label: 'success' };
    } else if (diffMeses >= 1) {
        return { color: '#ffb308', bgColor: '#ffb308', textColor: 'white', label: 'warning' };
    } else {
        return { color: '#dc3545', bgColor: '#dc3545', textColor: 'white', label: 'danger' };
    }
};

// Función auxiliar para generar HTML de la tabla desde plantilla
const generateReportHTML = (products, reportName) => {
    try {
        // Leer la plantilla HTML
        const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
        
        // Preparar datos
        const today = new Date();
        const formattedDate = today.toLocaleDateString('es-MX', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        // Generar filas de la tabla
        let tableRows = '';
        products.forEach((product, index) => {
            let fechaCaducidadHTML = 'N/A';
            
            if (product.Fecha_caducidad) {
                const fecha = new Date(product.Fecha_caducidad);
                const fechaFormateada = fecha.toLocaleDateString('es-MX');
                const colorData = getExpirationColor(product.Fecha_caducidad);
                
                fechaCaducidadHTML = `<span style="display: inline-block; padding: 4px 8px; border-radius: 4px; background-color: ${colorData.bgColor}; color: ${colorData.textColor}; font-weight: bold; font-size: 11px;">${fechaFormateada}</span>`;
            }
            
            const fechaRegistro = product.Fecha_registro
                ? new Date(product.Fecha_registro).toLocaleDateString('es-MX')
                : 'N/A';

            tableRows += `
                <tr>
                    <td>${product.Clasificacion || 'N/A'}</td>
                    <td>${product.Presentacion || 'N/A'}</td>
                    <td>${product.Sustancia_activa || 'N/A'}</td>
                    <td>${fechaCaducidadHTML}</td>
                    <td>${product.Cantidad || 0}</td>
                    <td>${product.No_pastillas || 0}</td>
                    <td>${product.Elementos_res || 0}</td>
                    <td>${product.Sede || 'N/A'}</td>
                    <td>${fechaRegistro}</td>
                </tr>
            `;
        });

        // Reemplazar placeholders en la plantilla
        const htmlContent = template
            .replace(/{{REPORT_NAME}}/g, reportName)
            .replace(/{{REPORT_DATE}}/g, formattedDate)
            .replace(/{{TOTAL_PRODUCTS}}/g, products.length.toString())
            .replace(/{{TABLE_ROWS}}/g, tableRows)
            .replace(/{{CURRENT_YEAR}}/g, new Date().getFullYear().toString());

        return htmlContent;

    } catch (error) {
        console.error('Error al leer la plantilla HTML:', error);
        throw new Error('No se pudo cargar la plantilla del reporte');
    }
};

// Generar reporte en PDF
controller.generatePDF = async (req, res) => {
    try {
        const { reportName } = req.body;
        
        if (!reportName || reportName.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                message: 'El nombre del reporte es requerido' 
            });
        }

        // Validar que el nombre no contenga caracteres especiales peligrosos
        const sanitizedName = reportName.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s\-_]/g, '');
        
        req.getConnection(async (err, conn) => {
            if (err) {
                console.error('Connection error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error de conexión a la base de datos' 
                });
            }

            // Obtener productos del inventario
            conn.query('CALL SHOW_PRODUCTS()', async (queryErr, results) => {
                if (queryErr) {
                    console.error('Query error:', queryErr);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Error al obtener los productos' 
                    });
                }

                const products = results[0];

                if (!products || products.length === 0) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'No hay productos en el inventario para generar el reporte' 
                    });
                }

                try {
                    // Generar HTML
                    const htmlContent = generateReportHTML(products, sanitizedName);

                    // Generar nombre único para el archivo
                    const timestamp = Date.now();
                    const storedFilename = `${timestamp}_${sanitizedName.replace(/\s+/g, '_')}.pdf`;
                    const filePath = path.join(REPORTS_DIR, storedFilename);

                    // Generar PDF con Puppeteer
                    const browser = await puppeteer.launch({
                        headless: true,
                        args: ['--no-sandbox', '--disable-setuid-sandbox']
                    });
                    const page = await browser.newPage();
                    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
                    
                    await page.pdf({
                        path: filePath,
                        format: 'A4',
                        landscape: true,
                        margin: {
                            top: '20px',
                            right: '20px',
                            bottom: '20px',
                            left: '20px'
                        },
                        printBackground: true
                    });

                    await browser.close();

                    // Obtener tamaño del archivo
                    const stats = fs.statSync(filePath);
                    const fileSize = stats.size;

                    // Guardar información en la base de datos
                    const originalName = `${sanitizedName}.pdf`;
                    const fileType = 'application/pdf';

                    conn.query(
                        'CALL INSERT_Report(?, ?, ?, ?)',
                        [originalName, storedFilename, fileType, fileSize],
                        (insertErr, insertResults) => {
                            if (insertErr) {
                                console.error('Error al guardar el reporte en BD:', insertErr);
                                // Eliminar archivo si falló la inserción en BD
                                fs.unlinkSync(filePath);
                                return res.status(500).json({ 
                                    success: false, 
                                    message: 'Error al guardar la información del reporte' 
                                });
                            }

                            const reportData = insertResults[0][0];
                            
                            res.json({ 
                                success: true, 
                                message: 'Reporte PDF generado exitosamente',
                                report: reportData
                            });
                        }
                    );

                } catch (pdfErr) {
                    console.error('Error al generar PDF:', pdfErr);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Error al generar el archivo PDF' 
                    });
                }
            });
        });

    } catch (error) {
        console.error('Error general:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
};

// Generar reporte en Excel usando ExcelJS
controller.generateExcel = async (req, res) => {
    try {
        const { reportName } = req.body;
        
        if (!reportName || reportName.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                message: 'El nombre del reporte es requerido' 
            });
        }

        // Validar que el nombre no contenga caracteres especiales peligrosos
        const sanitizedName = reportName.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s\-_]/g, '');
        
        req.getConnection(async (err, conn) => {
            if (err) {
                console.error('Connection error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error de conexión a la base de datos' 
                });
            }

            // Obtener productos del inventario usando SHOW_PRODUCTS
            conn.query('CALL SHOW_PRODUCTS()', async (queryErr, results) => {
                if (queryErr) {
                    console.error('Query error:', queryErr);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Error al obtener los productos' 
                    });
                }

                const products = results[0];

                if (!products || products.length === 0) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'No hay productos en el inventario para generar el reporte' 
                    });
                }

                try {
                    // Crear un nuevo workbook
                    const workbook = new ExcelJS.Workbook();
                    
                    // Configurar propiedades del documento
                    workbook.creator = 'Sistema de Gestión de Inventario de Enfermería';
                    workbook.created = new Date();
                    workbook.modified = new Date();
                    workbook.lastPrinted = new Date();
                    
                    // Crear hoja de trabajo
                    const worksheet = workbook.addWorksheet('Inventario', {
                        properties: { tabColor: { argb: 'FF003366' } }
                    });

                    // Preparar datos de fecha
                    const today = new Date();
                    const formattedDate = today.toLocaleDateString('es-MX', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    });

                    // Agregar encabezado del reporte
                    worksheet.mergeCells('A1:I1');
                    const titleCell = worksheet.getCell('A1');
                    titleCell.value = 'INVENTARIO DE PRODUCTOS MÉDICOS';
                    titleCell.font = { size: 16, bold: true, color: { argb: 'FF003366' } };
                    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
                    titleCell.height = 25;
                    
                    worksheet.mergeCells('A2:I2');
                    const universityCell = worksheet.getCell('A2');
                    universityCell.value = 'Universidad de Guanajuato';
                    universityCell.font = { size: 12, bold: false };
                    universityCell.alignment = { horizontal: 'center' };
                    
                    worksheet.mergeCells('A3:I3');
                    const campusCell = worksheet.getCell('A3');
                    campusCell.value = 'Campus Irapuato-Salamanca - DEM';
                    campusCell.font = { size: 12, bold: false };
                    campusCell.alignment = { horizontal: 'center' };

                    // Información de fecha
                    worksheet.mergeCells('A4:I4');
                    const dateCell = worksheet.getCell('A4');
                    dateCell.value = `Fecha de generación: ${formattedDate}`;
                    dateCell.font = { size: 11, bold: false };
                    dateCell.alignment = { horizontal: 'center' };

                    // Agregar encabezados de columna manualmente en la fila 5
                    const headerRow = worksheet.addRow([
                        'Clasificación',
                        'Presentación',
                        'Sustancia Activa',
                        'Fecha de Caducidad',
                        'Cantidad',
                        'No. Pastillas',
                        'Elementos Restantes',
                        'Sede',
                        'Fecha de Registro'
                    ]);

                    // Estilo del encabezado de la tabla
                    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                    headerRow.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FF003366' }
                    };
                    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
                    headerRow.height = 20;
                    
                    // Configurar anchos de columna
                    worksheet.getColumn(1).width = 20;
                    worksheet.getColumn(2).width = 20;
                    worksheet.getColumn(3).width = 25;
                    worksheet.getColumn(4).width = 18;
                    worksheet.getColumn(5).width = 10;
                    worksheet.getColumn(6).width = 12;
                    worksheet.getColumn(7).width = 15;
                    worksheet.getColumn(8).width = 25;
                    worksheet.getColumn(9).width = 18;

                    // Agregar datos de productos
                    products.forEach((product, index) => {
                        const fechaCaducidad = product.Fecha_caducidad 
                            ? new Date(product.Fecha_caducidad).toLocaleDateString('es-MX')
                            : 'N/A';
                        
                        const fechaRegistro = product.Fecha_registro
                            ? new Date(product.Fecha_registro).toLocaleDateString('es-MX')
                            : 'N/A';

                        const row = worksheet.addRow([
                            product.Clasificacion || 'N/A',
                            product.Presentacion || 'N/A',
                            product.Sustancia_activa || 'N/A',
                            fechaCaducidad,
                            product.Cantidad || 0,
                            product.No_pastillas || 0,
                            product.Elementos_res || 0,
                            product.Sede || 'N/A',
                            fechaRegistro
                        ]);

                        // Aplicar color de semáforo a la celda de fecha de caducidad
                        if (product.Fecha_caducidad) {
                            const colorData = getExpirationColor(product.Fecha_caducidad);
                            const caducidadCell = row.getCell(4); // Columna 4 = Fecha de Caducidad
                            caducidadCell.fill = {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: { argb: 'FF' + colorData.bgColor.substring(1) }
                            };
                            caducidadCell.font = { 
                                color: { argb: 'FFFFFFFF' }, 
                                bold: true 
                            };
                            caducidadCell.alignment = { horizontal: 'center', vertical: 'middle' };
                        }

                        // Estilo alternado para filas (excepto columna de caducidad que ya tiene su color)
                        if (index % 2 === 0) {
                            row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
                                // No aplicar fondo gris a la columna de caducidad (columna 4)
                                if (colNumber !== 4) {
                                    cell.fill = {
                                        type: 'pattern',
                                        pattern: 'solid',
                                        fgColor: { argb: 'FFF8F9FA' }
                                    };
                                }
                            });
                        }
                    });

                    // Agregar bordes a toda la tabla
                    const lastRow = worksheet.lastRow.number;
                    for (let i = 5; i <= lastRow; i++) {
                        const row = worksheet.getRow(i);
                        row.eachCell({ includeEmpty: true }, (cell) => {
                            cell.border = {
                                top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
                                left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
                                bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
                                right: { style: 'thin', color: { argb: 'FFD3D3D3' } }
                            };
                        });
                    }

                    // Generar nombre único para el archivo
                    const timestamp = Date.now();
                    const storedFilename = `${timestamp}_${sanitizedName.replace(/\s+/g, '_')}.xlsx`;
                    const filePath = path.join(REPORTS_DIR, storedFilename);

                    // Escribir archivo Excel
                    await workbook.xlsx.writeFile(filePath);

                    // Obtener tamaño del archivo
                    const stats = fs.statSync(filePath);
                    const fileSize = stats.size;

                    // Guardar información en la base de datos usando INSERT_Report
                    const originalName = `${sanitizedName}.xlsx`;
                    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

                    conn.query(
                        'CALL INSERT_Report(?, ?, ?, ?)',
                        [originalName, storedFilename, fileType, fileSize],
                        (insertErr, insertResults) => {
                            if (insertErr) {
                                console.error('Error al guardar el reporte en BD:', insertErr);
                                // Eliminar archivo si falló la inserción en BD
                                fs.unlinkSync(filePath);
                                return res.status(500).json({ 
                                    success: false, 
                                    message: 'Error al guardar la información del reporte' 
                                });
                            }

                            const reportData = insertResults[0][0];
                            
                            res.json({ 
                                success: true, 
                                message: 'Reporte Excel generado exitosamente',
                                report: reportData
                            });
                        }
                    );

                } catch (excelErr) {
                    console.error('Error al generar Excel:', excelErr);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Error al generar el archivo Excel' 
                    });
                }
            });
        });

    } catch (error) {
        console.error('Error general:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
};

// Descargar un reporte
controller.downloadReport = (req, res) => {
    try {
        const { id } = req.params;

        req.getConnection((err, conn) => {
            if (err) {
                console.error('Connection error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error de conexión a la base de datos' 
                });
            }

            // Obtener información del reporte
            conn.query(
                'CALL GET_REPORT_BY_ID(?)',
                [id],
                (queryErr, results) => {
                    if (queryErr) {
                        console.error('Query error:', queryErr);
                        return res.status(500).json({ 
                            success: false, 
                            message: 'Error al buscar el reporte' 
                        });
                    }

                    const reportData = results[0];
                    if (!reportData || reportData.length === 0) {
                        return res.status(404).json({ 
                            success: false, 
                            message: 'Reporte no encontrado' 
                        });
                    }

                    const report = reportData[0];
                    const filePath = path.join(REPORTS_DIR, report.stored_filename);

                    // Verificar que el archivo existe
                    if (!fs.existsSync(filePath)) {
                        return res.status(404).json({ 
                            success: false, 
                            message: 'El archivo del reporte no existe' 
                        });
                    }

                    // Descargar archivo
                    res.download(filePath, report.nombre_original, (downloadErr) => {
                        if (downloadErr) {
                            console.error('Error al descargar:', downloadErr);
                            return res.status(500).json({ 
                                success: false, 
                                message: 'Error al descargar el archivo' 
                            });
                        }
                    });
                }
            );
        });

    } catch (error) {
        console.error('Error general:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
};

// Listar todos los reportes
controller.listReports = (req, res) => {
    req.getConnection((err, conn) => {
        if (err) {
            console.error('Connection error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error de conexión a la base de datos' 
            });
        }

        conn.query(
            'CALL SHOW_REPORTS()',
            (queryErr, results) => {
                if (queryErr) {
                    console.error('Query error:', queryErr);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Error al obtener los reportes' 
                    });
                }

                res.json({ 
                    success: true, 
                    reports: results[0] || [] 
                });
            }
        );
    });
};

export default controller;
