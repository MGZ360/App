DELIMITER //
DROP TRIGGER T_Fecha_Atencion;
CREATE TRIGGER T_Fecha_Atencion
    BEFORE INSERT ON `RECIBE_ATENCION`
    FOR EACH ROW
BEGIN
    IF NEW.Fecha_hora IS NULL THEN
    SET NEW.Fecha_hora = CURDATE();
END IF;
END;
//
DELIMITER ;

##SET GLOBAL log_bin_trust_function_creators = 1;

DELIMITER //
DROP TRIGGER IF EXISTS T_Fecha_Registro_Producto;
CREATE TRIGGER T_Fecha_Registro_Producto
    BEFORE INSERT ON `PRODUCTOS_MEDICOS`
    FOR EACH ROW
BEGIN
    IF NEW.`Fecha_registro` IS NULL THEN
    SET NEW.`Fecha_registro` = CURDATE();
END IF;
END;
//
DELIMITER ;
#=======================
## STORED PROCEDURES
#=======================


#===========================================
## INSERSION DE PRODUCTO
DELIMITER //
DROP PROCEDURE IF EXISTS INS_PRODUCT;
CREATE PROCEDURE INS_PRODUCT(
    N_Clasificacion varchar(30),
    N_Presentacion varchar(30),
    N_Sustancia varchar(100),
    N_Cantidad int,
    N_Pastillas int,
    N_Elementos int,
    N_Sede VARCHAR(30),
    N_FechaCad DATE
)
BEGIN
	DECLARE exit HANDLER FOR SQLEXCEPTION
BEGIN
ROLLBACK;
SELECT 'Ocurrió un error al insertar el producto.' AS message;
END;
START TRANSACTION;

INSERT INTO PRODUCTOS_MEDICOS (Clasificacion, Presentacion, Sustancia_activa, Cantidad, No_pastillas, Elementos_res,Sede, Fecha_caducidad)
VALUES (N_Clasificacion, N_Presentacion,N_Sustancia,N_Cantidad,N_Pastillas,N_Elementos,N_Sede,N_FechaCad);
COMMIT;
SELECT 'Producto insertado correctamente.' AS message;
END;
//
DELIMITER ;

##CALL INS_PRODUCT('Paracetamol', 'Analgésico', 'Caja 20 tabletas', 'Paracetamol', 500, 20, 'DEM Yuriria', '2026-08-01');
#SELECT * FROM PRODUCTO_MEDICO;
#DELETE FROM PRODUCTO_MEDICO;

##====================================================
## ELIMINACION DE PRODUCTO (NECESARIO IMPLEMENTAR SOFT DELETE)
DROP PROCEDURE IF EXISTS Del_Product;
CREATE PROCEDURE DEL_PRODUCT(
    N_ProductoID INT
)
BEGIN
    DECLARE v_count INT;
    DECLARE v_status INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
BEGIN
ROLLBACK;
SELECT 'Ocurrió un error al eliminar el producto.' AS message;
END;

START TRANSACTION;

-- Validar existencia
SELECT COUNT(*) INTO v_count FROM PRODUCTOS_MEDICOS WHERE ProductoID = N_ProductoID;

-- Validar estado
IF v_count = 1 THEN
SELECT Status INTO v_status FROM PRODUCTOS_MEDICOS WHERE ProductoID = N_ProductoID;

IF v_status = 1 THEN
UPDATE PRODUCTOS_MEDICOS SET Status = 0 WHERE ProductoID = N_ProductoID;
SELECT 'Producto eliminado correctamente' AS message;
COMMIT;
ELSE
SELECT 'El producto ya está eliminado.' AS message;
ROLLBACK;
END IF;
ELSE
SELECT 'El producto no existe.' AS message;
ROLLBACK;
END IF;
END;

#CALL Del_Product(3);
#SELECT * FROM PRODUCTO_MEDICO WHERE STATUS >= 1;

#=====================================================
#		 MOSTRAR PRODUCTOS VALIDOS (con status 1)
DROP PROCEDURE IF EXISTS SHOW_PRODUCTS;
CREATE PROCEDURE IF NOT EXISTS SHOW_PRODUCTS()
BEGIN
SELECT * FROM PRODUCTOS_MEDICOS WHERE STATUS >= 1 ORDER BY Sustancia_Activa ASC;
END;

#CALL SHOW_PRODUCTS();

#==================================================
# EDITAR PRODUCTO
DROP PROCEDURE IF EXISTS EDIT_PRODUCT;
CREATE PROCEDURE IF NOT EXISTS EDIT_PRODUCT(
	N_ProductoID int,
	N_Clasificacion varchar(30),
	N_Presentacion varchar(30),
	N_Sustancia varchar(100),
	N_Cantidad int,
	N_Pastillas int,
	N_Elementos int,
	N_Sede VARCHAR(30),
	N_FechaCad DATE
)
BEGIN
	DECLARE v_count INT;
    DECLARE v_status INT;
	DECLARE exit HANDLER FOR SQLEXCEPTION
BEGIN
ROLLBACK;
SELECT 'Ocurrió un error al insertar el producto.' AS message;
END;
SELECT COUNT(*) INTO v_count FROM PRODUCTOS_MEDICOS WHERE ProductoID = N_ProductoID;
START TRANSACTION;
IF (v_count = 1) THEN
SELECT Status INTO v_status FROM PRODUCTOS_MEDICOS WHERE ProductoID = N_ProductoID;
IF (v_status = 1) THEN
UPDATE PRODUCTOS_MEDICOS SET
							Clasificacion = N_Clasificacion,
                           Presentacion = N_Presentacion,
                           Sustancia_activa = N_Sustancia,
                           Cantidad = N_Cantidad,
                           No_pastillas = N_Pastillas,
                           Elementos_res = N_Elementos,
                           Sede = N_Sede,
                           Fecha_caducidad = N_FechaCad WHERE ProductoID = N_ProductoID;

SELECT "Producto actualizado correctamente" as message;
COMMIT;
ELSE
SELECT "El producto está dado de baja." as message;
ROLLBACK;
END IF;
ELSE
SELECT "No existe el producto en la Base de datos." as message;
END IF;
END;
##=====================================================
## GET DETAILS (OBTENER INFO DE UN PREDUCTO)
DROP PROCEDURE IF EXISTS GET_PRODUCT;
CREATE PROCEDURE IF NOT EXISTS GET_PRODUCT(
	N_ProductoID int
)
BEGIN
	DECLARE v_count INT;
    DECLARE v_status INT;
	DECLARE exit HANDLER FOR SQLEXCEPTION
BEGIN
ROLLBACK;
SELECT 'Ocurrio un error al obtener el producto.' AS message;
END;
SELECT COUNT(*) INTO v_count FROM PRODUCTOS_MEDICOS WHERE ProductoID = N_ProductoID;
IF (v_count = 1) THEN
SELECT Status INTO v_status FROM PRODUCTOS_MEDICOS WHERE ProductoID = N_ProductoID;
IF (v_status = 1) THEN
SELECT * FROM PRODUCTOS_MEDICOS WHERE ProductoID = N_ProductoID;
ELSE
SELECT "El producto está dado de baja." as message;
END IF;
ELSE
SELECT "No existe el producto en la Base de datos." as message;
END IF;
END;

##CALL GET_PRODUCT(2);