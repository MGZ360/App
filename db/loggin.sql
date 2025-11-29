SELECT * FROM USERS;

DROP PROCEDURE IF EXISTS ADD_USER;
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS ADD_USER(
    N_EID INT,
    N_USER VARCHAR(30), 
    N_PASSWORD CHAR(60), 
    N_IMGPATH VARCHAR(30)
)
BEGIN
    DECLARE U_STATUS INT;
    DECLARE ENF_STATUS INT;

    DECLARE exit HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 'Ocurrió un error al insertar el usuario.' AS message;
    END;

    -- Validaciones previas
    SELECT COUNT(*) INTO ENF_STATUS FROM ENFERMERA WHERE EnfermeraID = N_EID;
    SELECT COUNT(*) INTO U_STATUS FROM USERS WHERE U_EID = N_EID;
    
    START TRANSACTION;
        IF (ENF_STATUS >= 1 AND U_STATUS = 0) THEN
            INSERT INTO USERS (U_EID, U_User,U_Password, U_ImgPath) 
            VALUES (N_EID, N_USER ,N_PASSWORD, N_IMGPATH);
            SELECT "Usuario insertado correctamente" AS message;
            COMMIT;
        ELSE
            IF (ENF_STATUS < 1) THEN
                SELECT "El ID de enfermera no existe." AS message;
            ELSEIF (U_STATUS <> 0) THEN
                SELECT "El ID de enfermera ya está en uso." AS message;
            END IF;
            ROLLBACK;
        END IF;
END//
DELIMITER ;

 * INSERTARE UNA ENFERMERA TEMPORAL XD
 * */
## SP para obtener usuario con su info
DELIMITER //
DROP PROCEDURE IF EXISTS GET_USER_BY_ID;
CREATE PROCEDURE IF NOT EXISTS GET_USER_BY_ID(N_ID INT)BEGIN
	SELECT US.U_EID,US.U_User,US.U_Password, US.U_ImgPath, E.Nombre, E.Apellido_pat, E.Apellido_mat, E.Telefono FROM USERS as US INNER JOIN
 	ENFERMERA AS E WHERE US.U_EID = E.EnfermeraID;
END//	
DELIMITER ;
CALL GET_USER(1);
DELIMITER //
# ============
SELECT * FROM USERS;
DROP PROCEDURE IF EXISTS GET_USER_BY_USERNAME;
CREATE PROCEDURE IF NOT EXISTS GET_USER_BY_USERNAME(N_Username varchar(30))BEGIN
	SELECT US.U_EID,US.U_User,US.U_Password, US.U_ImgPath, E.Nombre, E.Apellido_pat, E.Apellido_mat, E.Telefono FROM USERS as US INNER JOIN
 	ENFERMERA AS E WHERE (US.U_EID = E.EnfermeraID) AND (US.U_User = N_Username);
END//	
DELIMITER ;
