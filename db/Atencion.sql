DELIMITER //
DROP PROCEDURE IF EXISTS BuscarMedicamentos;
CREATE PROCEDURE IF NOT EXISTS  BuscarMedicamentos(IN busqueda VARCHAR(50))
BEGIN
  SELECT * FROM PRODUCTOS_MEDICOS
  WHERE Status = 1 AND (
    Sustancia_activa LIKE CONCAT('%', busqueda, '%')
  )
  ORDER BY Fecha_caducidad DESC;
END //
DELIMITER ;

##CALL BuscarMedicamentos("Paracetamol");
##SELECT * FROM PRODUCTOS_MEDICOS; 

DELIMITER //
DROP PROCEDURE IF EXISTS GET_MediCart;
CREATE PROCEDURE IF NOT EXISTS GET_MediCart()
BEGIN
	SELECT TM.ProductoID, PM.Clasificacion, PM.Presentacion, PM.Sustancia_activa, PM.Fecha_caducidad, TM.Cantidad_Sum FROM PRODUCTOS_MEDICOS AS PM
	INNER JOIN TEMP_MEDIC AS TM USING (ProductoID) ORDER BY PM.Sustancia_activa ASC;
END//
DELIMITER ;

#SELECT * FROM TEMP_MEDIC;
#SELECT * FROM PRODUCTOS_MEDICOS;
DROP PROCEDURE IF EXISTS ADD_MediCart;
CREATE PROCEDURE ADD_MediCart(
	IN N_ProductoID INT,
	IN N_CantidadSolicitada INT
)
BEGIN
	DECLARE v_existencia_total INT;
	DECLARE v_sustancia VARCHAR(100);
	DECLARE v_cantidad_actual INT DEFAULT 0;
	DECLARE v_nueva_cantidad INT;
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		ROLLBACK;
		SELECT 'Error al procesar TEMP_MEDIC' AS message, "false" as code;
	END;
	START TRANSACTION;

	-- Obtener existencia total y sustancia
	SELECT 
		(Cantidad * No_pastillas) + Elementos_res,
		Sustancia_activa
	INTO 
		v_existencia_total,
		v_sustancia
	FROM PRODUCTOS_MEDICOS
	WHERE ProductoID = N_ProductoID AND Status = 1;

	-- Obtener cantidad actual en TEMP_MEDIC si existe
	SELECT Cantidad_Sum INTO v_cantidad_actual
	FROM TEMP_MEDIC
	WHERE ProductoID = N_ProductoID;

	-- Si no existe, v_cantidad_actual será NULL → lo convertimos a 0
	IF v_cantidad_actual IS NULL THEN
		SET v_cantidad_actual = 0;
	END IF;

	-- Calcular nueva cantidad total
	SET v_nueva_cantidad = v_cantidad_actual + N_CantidadSolicitada;

	-- Validar disponibilidad
	IF v_nueva_cantidad <= v_existencia_total THEN

		-- Si ya existe, actualiza
		IF v_cantidad_actual > 0 THEN
			UPDATE TEMP_MEDIC
			SET Cantidad_Sum = v_nueva_cantidad
			WHERE ProductoID = N_ProductoID;

		-- Si no existe, inserta
		ELSE
			INSERT INTO TEMP_MEDIC (ProductoID, Sustancia_activa, Cantidad_Sum)
			VALUES (N_ProductoID, v_sustancia, N_CantidadSolicitada);
		END IF;

		SELECT CONCAT('Producto actualizado. Cantidad total en carrito: ', v_nueva_cantidad) AS message, "true" as code;
		COMMIT;

	ELSE
		SELECT CONCAT('No hay suficientes elementos. Disponibles: ', v_existencia_total, ', solicitados: ', v_nueva_cantidad) AS message, "false" as code;
		ROLLBACK;
	END IF;
END

/* AQUI EMPIEZA DELETE DEL CARRITO*/
DROP PROCEDURE IF EXISTS DEL_MediCart;
CREATE PROCEDURE IF NOT EXISTS DEL_MediCart(
	IN N_ProductoID INT
)
BEGIN
	DECLARE inCart INT;
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		ROLLBACK;
		SELECT 'Error al procesar TEMP_MEDIC' AS message, "false" as code;
	END;
	START TRANSACTION;

	-- Obtener existencia 
	SELECT COUNT(*) INTO inCart
	FROM TEMP_MEDIC tm
	WHERE tm.ProductoID = N_ProductoID;

	-- Validar disponibilidad
	IF (inCart >= 1) THEN
		-- SI SI EXISTE
		DELETE FROM TEMP_MEDIC as TM WHERE TM.ProductoID = N_ProductoID;
		SELECT "Producto eliminado correctamente" AS message, "true" AS code;
		COMMIT;
	ELSE
		SELECT "Error al eliminar el producto, no se encontró." AS message, "false" AS code;
		ROLLBACK;
	END IF;
END;

##call DEL_MEDICART(3);
/*AQUI EMPIEZA EL CLEAN TEMP_MEDIC*/
CREATE PROCEDURE IF NOT EXISTS Reset_Cart()
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		ROLLBACK;
		SELECT 'Error al cancelar la atencion' AS message, "false" as code;
	END;
	START TRANSACTION;
	TRUNCATE TABLE TEMP_MEDIC;
	SELECT 'Limpiado correctamente' AS message, "true" as code;
END;

/*AQUI EMPIEZA EL SP DE ATENCION*/
DELIMITER //

DROP PROCEDURE IF EXISTS ADD_ATENTION;

CREATE PROCEDURE IF NOT EXISTS ADD_ATENTION(
    IN N_EnfID INT,
    IN N_Diagnostico VARCHAR(60),
    IN N_P_NUA INT,
    IN N_P_Nombre VARCHAR(30),
    IN N_P_ApeP VARCHAR(30),
    IN N_P_ApeM VARCHAR(30)
)
BEGIN
    -- Variables generales
    DECLARE PacienteID_N INT;
    DECLARE AtencionID_N INT;

    -- Variables del cursor
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_ProductoID INT;
    DECLARE v_CantidadSum INT;      -- Cantidad a dispensar (se modifica)
    DECLARE v_CantidadOriginal INT; -- Cantidad real a insertar
    DECLARE v_Cantidad INT;         -- Cajas completas
    DECLARE v_NoPastillas INT;      -- Cantidad por caja
    DECLARE v_ElementosRes INT;     -- Resto de caja abierta

    -- Cursor
    DECLARE cur CURSOR FOR
        SELECT ProductoID, Cantidad_Sum FROM TEMP_MEDIC;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    -- Handler general
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 'Error al procesar atención' AS message, "false" AS code;
    END;

    START TRANSACTION;

    -- ========== PACIENTE =====================
    IF N_P_NUA > 0 THEN
        SELECT PacienteID INTO PacienteID_N
        FROM PACIENTE
        WHERE NUA = N_P_NUA LIMIT 1;

        IF PacienteID_N IS NULL THEN
            INSERT INTO PACIENTE (NUA, Nombre, Apellido_pat, Apellido_mat)
            VALUES (N_P_NUA, N_P_Nombre, N_P_ApeP, N_P_ApeM);

            SELECT PacienteID INTO PacienteID_N
            FROM PACIENTE
            WHERE NUA = N_P_NUA LIMIT 1;
        END IF;
    ELSE
        SET PacienteID_N = 0;
    END IF;

    -- ========== CREAR ATENCION ==================
    INSERT INTO RECIBE_ATENCION (Diagnostico, Fecha_hora, EnfermeraID, PacienteID)
    VALUES (N_Diagnostico, NOW(), N_EnfID, PacienteID_N);

    SET AtencionID_N = LAST_INSERT_ID();

    -- ========== INVENTARIO ======================
    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO v_ProductoID, v_CantidadSum;
        IF done THEN
            LEAVE read_loop;
        END IF;

        SET v_CantidadOriginal = v_CantidadSum;

        SELECT Cantidad, No_pastillas, Elementos_res
        INTO v_Cantidad, v_NoPastillas, v_ElementosRes
        FROM PRODUCTOS_MEDICOS
        WHERE ProductoID = v_ProductoID;

        -- Verificar inventario total
        IF v_CantidadSum > (v_Cantidad * v_NoPastillas + v_ElementosRes) THEN
            ROLLBACK;
            SELECT CONCAT('Inventario insuficiente para ProductoID: ', v_ProductoID) AS message,
                   "false" AS code;
            LEAVE read_loop;
        END IF;

        -- Si la caja está cerrada
        IF v_ElementosRes = 0 THEN
            IF v_Cantidad > 0 THEN
                SET v_Cantidad = v_Cantidad - 1;
                SET v_ElementosRes = v_NoPastillas;
            ELSE
                ROLLBACK;
                SELECT CONCAT('No hay cajas disponibles para ProductoID: ', v_ProductoID) AS message,
                       "false" AS code;
                LEAVE read_loop;
            END IF;
        END IF;

        -- Consumo de unidades
        WHILE v_CantidadSum > 0 DO

            IF v_CantidadSum <= v_ElementosRes THEN
                SET v_ElementosRes = v_ElementosRes - v_CantidadSum;
                SET v_CantidadSum = 0;

            ELSE
                SET v_CantidadSum = v_CantidadSum - v_ElementosRes;
                SET v_ElementosRes = 0;

                IF v_Cantidad > 0 THEN
                    SET v_Cantidad = v_Cantidad - 1;
                    SET v_ElementosRes = v_NoPastillas;
                ELSE
                    ROLLBACK;
                    SELECT CONCAT('No hay suficientes cajas para ProductoID: ', v_ProductoID) AS message,
                           "false" AS code;
                    LEAVE read_loop;
                END IF;

            END IF;

        END WHILE;

        -- Actualizar inventario final
        UPDATE PRODUCTOS_MEDICOS
        SET Cantidad = v_Cantidad,
            Elementos_res = v_ElementosRes
        WHERE ProductoID = v_ProductoID;

        -- Insertar relación de atención-producto
        INSERT INTO ATENCION_PRODUCTO (AtencionID, ProductoID, Cantidad)
        VALUES (AtencionID_N, v_ProductoID, v_CantidadOriginal);

    END LOOP;

    CLOSE cur;

    -- Limpiar carrito
    TRUNCATE TABLE TEMP_MEDIC;

    COMMIT;

    SELECT 'Atención registrada correctamente' AS message, "true" AS code;

END;

 //

DELIMITER ;

/*
SELECT RA.AtencionID, PM.Sustancia_activa, AP.Cantidad, E.Nombre AS "ENFERMERA" , P.Nombre AS "PACIENTE", P.NUA FROM RECIBE_ATENCION AS RA
INNER JOIN ATENCION_PRODUCTO AS AP ON RA.AtencionID = AP.AtencionID
INNER JOIN PACIENTE AS P ON P.PacienteID = RA.PacienteID
INNER JOIN ENFERMERA AS E ON RA.EnfermeraID = E.EnfermeraID
INNER JOIN PRODUCTOS_MEDICOS AS PM ON PM.ProductoID = AP.ProductoID
ORDER BY RA.AtencionID ASC;

SELECT * FROM RECIBE_ATENCION;
SELECT * FROM PRODUCTOS_MEDICOS;
SELECT * FROM ATENCION_PRODUCTO;
SELECT * FROM PACIENTE;*/