/* ENFERMERA */

INSERT INTO ENFERMERA (Apellido_pat, Apellido_mat, Nombre, Telefono) VALUES
('López', 'García', 'Ana', '5512345678');

INSERT INTO ENFERMERA (Apellido_pat, Apellido_mat, Nombre, Telefono) VALUES
('Martínez', 'Pérez', 'Sofía', '5543219876');

INSERT INTO ENFERMERA (Apellido_pat, Apellido_mat, Nombre, Telefono) VALUES
('Ramírez', 'Torres', 'Lucía', '5598761234');

INSERT INTO ENFERMERA (Apellido_pat, Apellido_mat, Nombre, Telefono) VALUES
('Hernández', 'Soto', 'María', '5587654321');

INSERT INTO ENFERMERA (Apellido_pat, Apellido_mat, Nombre, Telefono) VALUES
('González', 'Ruiz', 'Carmen', '5511122233');

INSERT INTO ENFERMERA (Apellido_pat, Apellido_mat, Nombre, Telefono) VALUES
('Vega', 'Flores', 'Paula', '5522233344');

INSERT INTO ENFERMERA (Apellido_pat, Apellido_mat, Nombre, Telefono) VALUES
('Rojas', 'Navarro', 'Verónica', '5533344455');

INSERT INTO ENFERMERA (Apellido_pat, Apellido_mat, Nombre, Telefono) VALUES
('Castillo', 'Méndez', 'Inés', '5566677788');

INSERT INTO ENFERMERA (Apellido_pat, Apellido_mat, Nombre, Telefono) VALUES
('Ortiz', 'Sánchez', 'Clara', '5577788899');

INSERT INTO ENFERMERA (Apellido_pat, Apellido_mat, Nombre, Telefono) VALUES
('Serrano', 'Díaz', 'Elena', '5509988776');

INSERT INTO ENFERMERA (Apellido_pat, Apellido_mat, Nombre, Telefono) VALUES
('Vazques', 'Díaz', 'Paula', 5509391776);

INSERT INTO ENFERMERA (Apellido_pat, Apellido_mat, Nombre, Telefono) VALUES
('Ortiz', 'Moncada', 'Monica', '4451674832');


/* Se ejecuto corrrectamente, sin embargo se insertaron caracteres en el campo de Telefono lo cual esta mal
INSERT INTO ENFERMERA (Apellido_pat, Apellido_mat, Nombre, Telefono) VALUES
('Ortiz', 'Cruz', 'Monica', 'abcefchij');
*/


SELECT * FROM ENFERMERA;



/* PACIENTE */

INSERT INTO PACIENTE (NUA, Nombre, Apellido_pat, Apellido_mat, Historia_clinica) VALUES
(100001, 'Juan', 'Pérez', 'Lara', 'Alergia a penicilina');

INSERT INTO PACIENTE (NUA, Nombre, Apellido_pat, Apellido_mat, Historia_clinica) VALUES
(10002, 'María', 'Santos', 'Reyes', 'Hipertensión controlada');

INSERT INTO PACIENTE (NUA, Nombre, Apellido_pat, Apellido_mat, Historia_clinica) VALUES
(10003, 'Carlos', 'Molina', 'Gómez', 'Diabetes tipo 2');

INSERT INTO PACIENTE (NUA, Nombre, Apellido_pat, Apellido_mat, Historia_clinica) VALUES
(10004, 'Luisa', 'Torres', 'Vargas', 'Asma moderada');

INSERT INTO PACIENTE (NUA, Nombre, Apellido_pat, Apellido_mat, Historia_clinica) VALUES
(10005, 'Pedro', 'Ramírez', 'Cruz', 'Cirugía apendicitis 2018');

INSERT INTO PACIENTE (NUA, Nombre, Apellido_pat, Apellido_mat, Historia_clinica) VALUES
(10006, 'Sergio', 'Luna', 'Castro', 'No antecedentes relevantes');

INSERT INTO PACIENTE (NUA, Nombre, Apellido_pat, Apellido_mat, Historia_clinica) VALUES
(10007, 'Ana', 'Ríos', 'Mora', 'Embarazo 2° trimestre');

INSERT INTO PACIENTE (NUA, Nombre, Apellido_pat, Apellido_mat, Historia_clinica) VALUES
(10008, 'Felipe', 'Ibáñez', 'Salas', 'Epilepsia controlada');

INSERT INTO PACIENTE (NUA, Nombre, Apellido_pat, Apellido_mat, Historia_clinica) VALUES
(10009, 'Marta', 'Bravo', 'León', 'Alergia a látex');

INSERT INTO PACIENTE (NUA, Nombre, Apellido_pat, Apellido_mat, Historia_clinica) VALUES
(10010, 'Diego', 'Pacheco', 'Valdez', 'Tabaquismo');


/* Se ejecuto correctamente sin embargo se duplico el NUA de este paciente se duplico
INSERT INTO PACIENTE (NUA, Nombre, Apellido_pat, Apellido_mat, Historia_clinica) VALUES
(10010, 'Diego', 'Pacheco', 'Valdez', 'Tabaquismo');
*/


SELECT  * FROM PACIENTE;






/* PRODUCTO_MEDICO */

INSERT INTO PRODUCTO_MEDICO (Nombre, Clasificacion, Presentacion, Sustancia_activa, Cantidad, No_pastillas, Sede, Fecha_caducidad, Fecha_registro) VALUES
('Paracetamol', 'Analgésico', 'Caja 20 tabletas', 'Paracetamol', 500, 20, 'DEM Yuriria', '2026-08-01', '2025-10-01');

INSERT INTO PRODUCTO_MEDICO (Nombre, Clasificacion, Presentacion, Sustancia_activa, Cantidad, No_pastillas, Sede, Fecha_caducidad, Fecha_registro) VALUES
('Amoxicilina', 'Antibiótico', 'Frasco 100 ml', 'Amoxicilina', 200, 0, 'DEM Yuriria', '2025-03-15', '2025-09-10');

INSERT INTO PRODUCTO_MEDICO (Nombre, Clasificacion, Presentacion, Sustancia_activa, Cantidad, No_pastillas, Sede, Fecha_caducidad, Fecha_registro) VALUES
('Ibuprofeno', 'Antiinflamatorio', 'Caja 30 tabletas', 'Ibuprofeno', 300, 30, 'DEM Yuriria', '2027-01-20', '2025-11-05');

INSERT INTO PRODUCTO_MEDICO (Nombre, Clasificacion, Presentacion, Sustancia_activa, Cantidad, No_pastillas, Sede, Fecha_caducidad, Fecha_registro) VALUES
('Metformina', 'Antidiabético', 'Blíster 60 tabletas', 'Metformina', 150, 60, 'DEM Yuriria', '2026-05-30', '2025-08-20');

INSERT INTO PRODUCTO_MEDICO (Nombre, Clasificacion, Presentacion, Sustancia_activa, Cantidad, No_pastillas, Sede, Fecha_caducidad, Fecha_registro) VALUES
('Salbutamol', 'Broncodilatador', 'Inhalador', 'Salbutamol', 80, 0, 'DEM Yuriria', '2026-12-10', '2025-12-01');

INSERT INTO PRODUCTO_MEDICO (Nombre, Clasificacion, Presentacion, Sustancia_activa, Cantidad, No_pastillas, Sede, Fecha_caducidad, Fecha_registro) VALUES
('Omeprazol', 'Antirreflujo', 'Caja 28 cápsulas', 'Omeprazol', 220, 28, 'DEM Yuriria', '2028-04-18', '2025-07-15');

INSERT INTO PRODUCTO_MEDICO (Nombre, Clasificacion, Presentacion, Sustancia_activa, Cantidad, No_pastillas, Sede, Fecha_caducidad, Fecha_registro) VALUES
('Aspirina', 'Antiplaquetario', 'Caja 30 tabletas', 'Ácido acetilsalicílico', 400, 30, 'DEM Yuriria', '2026-11-11', '2025-10-20');

INSERT INTO PRODUCTO_MEDICO (Nombre, Clasificacion, Presentacion, Sustancia_activa, Cantidad, No_pastillas, Sede, Fecha_caducidad, Fecha_registro) VALUES
('Loratadina', 'Antihistamínico', 'Caja 10 tabletas', 'Loratadina', 180, 10, 'DEM Yuriria', '2025-09-09', '2025-09-01');

INSERT INTO PRODUCTO_MEDICO (Nombre, Clasificacion, Presentacion, Sustancia_activa, Cantidad, No_pastillas, Sede, Fecha_caducidad, Fecha_registro) VALUES
('Insulina', 'Hormona', 'Frasco 10 ml', 'Insulina humana', 60, 0, 'DEM Yuriria', '2025-06-30', '2025-06-01');

INSERT INTO PRODUCTO_MEDICO (Nombre, Clasificacion, Presentacion, Sustancia_activa, Cantidad, No_pastillas, Sede, Fecha_caducidad, Fecha_registro) VALUES
('Claritromicina', 'Antibiótico', 'Caja 14 tabletas', 'Claritromicina', 120, 14, 'DEM Yuriria', '2025-02-28', '2025-11-10');



SELECT * FROM PRODUCTO_MEDICO;





/* RECIBE_ATENCION */

INSERT INTO RECIBE_ATENCION (Diagnostico, Tipo_atencion, Fecha_hora, EnfermeraID, PacienteID) VALUES
('Faringitis aguda', 'Consulta', '2025-11-01 09:15:00', 1, 1);

INSERT INTO RECIBE_ATENCION (Diagnostico, Tipo_atencion, Fecha_hora, EnfermeraID, PacienteID) VALUES
('Control de presión', 'Control', '2025-11-01 10:00:00', 2, 2);

INSERT INTO RECIBE_ATENCION (Diagnostico, Tipo_atencion, Fecha_hora, EnfermeraID, PacienteID) VALUES
('Hiperglucemia', 'Urgencia', '2025-11-02 14:30:00', 3, 3);

INSERT INTO RECIBE_ATENCION (Diagnostico, Tipo_atencion, Fecha_hora, EnfermeraID, PacienteID) VALUES
('Crisis asmática leve', 'Urgencia', '2025-11-03 18:20:00', 5, 4);

INSERT INTO RECIBE_ATENCION (Diagnostico, Tipo_atencion, Fecha_hora, EnfermeraID, PacienteID) VALUES
('Dolor abdominal', 'Consulta', '2025-11-04 11:50:00', 4, 5);

INSERT INTO RECIBE_ATENCION (Diagnostico, Tipo_atencion, Fecha_hora, EnfermeraID, PacienteID) VALUES
('Consulta prenatal', 'Control', '2025-11-05 08:40:00', 7, 7);

INSERT INTO RECIBE_ATENCION (Diagnostico, Tipo_atencion, Fecha_hora, EnfermeraID, PacienteID) VALUES
('Convulsión (control)', 'Control', '2025-11-06 16:10:00', 6, 8);

INSERT INTO RECIBE_ATENCION (Diagnostico, Tipo_atencion, Fecha_hora, EnfermeraID, PacienteID) VALUES
('Revisión postoperatoria', 'Control', '2025-11-07 12:00:00', 8, 6);

INSERT INTO RECIBE_ATENCION (Diagnostico, Tipo_atencion, Fecha_hora, EnfermeraID, PacienteID) VALUES
('Alergia cutánea', 'Consulta', '2025-11-08 15:30:00', 9, 9);

INSERT INTO RECIBE_ATENCION (Diagnostico, Tipo_atencion, Fecha_hora, EnfermeraID, PacienteID) VALUES
('Bronquitis', 'Consulta', '2025-11-09 13:25:00', 10, 10);

INSERT INTO RECIBE_ATENCION (Diagnostico, Tipo_atencion, Fecha_hora, EnfermeraID, PacienteID) VALUES
('Bronquitis', 'Consulta', '2025-11-21 14:25:00', 7, 5);


/* Se duplico con los mismo campos de Fecha_hora y EnfermeraID
INSERT INTO RECIBE_ATENCION (Diagnostico, Tipo_atencion, Fecha_hora, EnfermeraID, PacienteID) VALUES
('Bronquitis', 'Consulta', '2025-11-21 14:25:00', 7, 5);
*/


SELECT * FROM RECIBE_ATENCION;




/* ATENCION_PRODUCTO - enlazamiento entre Atencion con Producto */
INSERT INTO ATENCION_PRODUCTO (AtencionID, ProductoID) VALUES
(1, 1);

INSERT INTO ATENCION_PRODUCTO (AtencionID, ProductoID) VALUES
(2, 7);

INSERT INTO ATENCION_PRODUCTO (AtencionID, ProductoID) VALUES
(3, 9);

INSERT INTO ATENCION_PRODUCTO (AtencionID, ProductoID) VALUES
(4, 5);


/* Se duplico con el mismo registro ProductoID 
INSERT INTO ATENCION_PRODUCTO (AtencionID, ProductoID) VALUES
(4, 5);
*/

INSERT INTO ATENCION_PRODUCTO (AtencionID, ProductoID) VALUES
(5, 2);

INSERT INTO ATENCION_PRODUCTO (AtencionID, ProductoID) VALUES
(6, 4);

INSERT INTO ATENCION_PRODUCTO (AtencionID, ProductoID) VALUES
(7, 9);

INSERT INTO ATENCION_PRODUCTO (AtencionID, ProductoID) VALUES
(8, 6);

INSERT INTO ATENCION_PRODUCTO (AtencionID, ProductoID) VALUES
(9, 8);

INSERT INTO ATENCION_PRODUCTO (AtencionID, ProductoID) VALUES
(10, 3);

INSERT INTO ATENCION_PRODUCTO (AtencionID, ProductoID) VALUES
(11, 7);


