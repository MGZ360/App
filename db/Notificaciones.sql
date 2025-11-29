SET GLOBAL event_scheduler = ON;

DROP TABLE IF EXISTS NOTIFICATIONS;
CREATE TABLE IF NOT EXISTS NOTIFICATIONS(
	ProductoID INT,
	Fecha_caducidad date,
	Sustancia_activa VARCHAR(100),
	CODE int CHECK (CODE >=0 AND CODE <2) -- SOLO VALORES 0 o 1
);

-- BLOQUE DEL CURSOR
DELIMITER //
CALL ADD_NOTIFICATIONS();
SELECT * FROM NOTIFICATIONS;
TRUNCATE TABLE NOTIFICATIONS;

DROP PROCEDURE IF EXISTS ADD_NOTIFICATIONS;
CREATE PROCEDURE IF NOT EXISTS ADD_NOTIFICATIONS()
BEGIN
    -- Variables
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_ProductoID INT;
    DECLARE v_Sustancia VARCHAR(100);
	DECLARE v_Fecha_cad date;
	DECLARE v_Meses INT;
    -- Cursor
    DECLARE cur CURSOR FOR
        SELECT ProductoID, Sustancia_activa, Fecha_caducidad FROM PRODUCTOS_MEDICOS WHERE Status = 1;
    -- Handler para fin de datos
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
	-- BORRAR NOTIFICACIONES ACTUALES
	TRUNCATE TABLE NOTIFICATIONS;
    -- Abrir cursor
    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO v_ProductoID, v_Sustancia, v_Fecha_cad;
    -- NO TOCAR
        IF done THEN
            LEAVE read_loop;
        END IF;
        -- Aquí va la lógica con cada fila
    	SELECT CEIL(DATEDIFF(v_Fecha_cad, CURDATE()) / 30) INTO v_Meses;
        IF(v_Meses = 1) THEN
    		INSERT INTO NOTIFICATIONS (ProductoID, Fecha_caducidad, Sustancia_activa, CODE)
    		VALUES (v_ProductoID, v_Fecha_cad, v_Sustancia, 1);
        ELSEIF (v_Meses <=0) THEN 
        	INSERT INTO NOTIFICATIONS (ProductoID, Fecha_caducidad, Sustancia_activa, CODE)
    		VALUES (v_ProductoID, v_Fecha_cad, v_Sustancia, 0);
        END IF;
    END LOOP;
    -- Cerrar cursor
    CLOSE cur;
END //
DELIMITER ;
-- BLOQUE DEL EVENTO
CREATE EVENT IF NOT EXISTS NotificationsWorker
ON SCHEDULE EVERY 1 DAY
DO
BEGIN
    -- Insertar notificaciones nuevas
    CALL ADD_NOTIFICATIONS();
END;

-- ============= BLOQUE MOSTRAR NOTIFICACIONES
CREATE PROCEDURE IF NOT EXISTS SHOW_NOTIFICATIONS()
BEGIN
	SELECT * FROM NOTIFICATIONS;
END;

-- FECHA FUTURA, FECHA ACTUAL
-- SELECT ROUND(DATEDIFF('2026-01-01', '2025-11-23') / 30) AS meses_aprox;