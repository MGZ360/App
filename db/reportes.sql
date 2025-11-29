-- Tabla Reportes
CREATE TABLE IF NOT EXISTS reportes ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    nombre_original VARCHAR(255) NOT NULL, -- Nombre original del archivo (ej: "Reporte Mensual Nov 2025.pdf")
    stored_filename VARCHAR(255) NOT NULL, -- Nombre único en disco (ej: "1732377600_reporte.pdf")
    file_type VARCHAR(100) NOT NULL, -- Tipo MIME del archivo (application/pdf o application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)
    peso BIGINT, -- Tamaño del archivo en bytes
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP, -- Fecha y hora de generación del reporte
    INDEX idx_created (fecha_creacion DESC)
) 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_spanish_ci;

/*
SHOW TABLES LIKE 'reportes';
DESCRIBE reportes;
*/


DROP PROCEDURE IF EXISTS INSERT_Report;

DELIMITER $$
CREATE PROCEDURE INSERT_Report(
    IN p_nombre_original VARCHAR(255),
    IN p_stored_filename VARCHAR(255),
    IN p_file_type VARCHAR(100),
    IN p_peso BIGINT
)
BEGIN
    -- Insertar el nuevo reporte en la tabla
    INSERT INTO reportes (
        nombre_original,
        stored_filename,
        file_type,
        peso
    ) VALUES (
        p_nombre_original,
        p_stored_filename,
        p_file_type,
        p_peso
    );
    
    -- Devolver el ID del reporte insertado y su fecha de creación
    SELECT 
        LAST_INSERT_ID() AS id,
        p_nombre_original AS nombre_original,
        p_stored_filename AS stored_filename,
        p_file_type AS file_type,
        p_peso AS peso,
        (SELECT fecha_creacion FROM reportes WHERE id = LAST_INSERT_ID()) AS fecha_creacion;
END$$
DELIMITER ;

/*uso:
CALL INSERT_Report('Reporte Mensual Noviembre 2025.pdf', '1732377600_reporte_mensual.pdf', 'application/pdf', 245678);
*/

-- Procedimiento para listar todos los reportes ordenados por fecha
DROP PROCEDURE IF EXISTS SHOW_REPORTS;

DELIMITER $$
CREATE PROCEDURE SHOW_REPORTS()
BEGIN
    -- Obtener todos los reportes ordenados por fecha de creación (más recientes primero)
    SELECT 
        id,
        nombre_original,
        stored_filename,
        file_type,
        peso,
        fecha_creacion
    FROM reportes
    ORDER BY fecha_creacion DESC;
END$$
DELIMITER ;

/*Ejemplo de uso:
CALL SHOW_REPORTS();
*/

-- Procedimiento para obtener un reporte específico por ID
DROP PROCEDURE IF EXISTS GET_REPORT_BY_ID;

DELIMITER $$
CREATE PROCEDURE GET_REPORT_BY_ID(
    IN p_id INT
)
BEGIN
    -- Obtener información de un reporte específico
    SELECT 
        id,
        nombre_original,
        stored_filename,
        file_type,
        peso,
        fecha_creacion
    FROM reportes
    WHERE id = p_id;
END $$
DELIMITER ;

/*Ejemplo de uso:
CALL GET_REPORT_BY_ID(1);
*/

SELECT * FROM reportes;

-- Otorgar permisos al usuario webclient
GRANT EXECUTE ON PROCEDURE `UG-ENF`.`INSERT_Report` TO 'webclient'@'%';
GRANT EXECUTE ON PROCEDURE `UG-ENF`.`SHOW_REPORTS` TO 'webclient'@'%';
GRANT EXECUTE ON PROCEDURE `UG-ENF`.`GET_REPORT_BY_ID` TO 'webclient'@'%';
FLUSH PRIVILEGES;