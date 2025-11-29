const model = require("./mysql");

const save = async (nombre, clasificacion, presentacion, sustancia, cantidad, noPastillas, sede, fechaCaducidad) => {
    const sql = "CALL INS_PRODUCT(?, ?, ?, ?, ?, ?, ?, ?)";

    try {
        await pool.query(sql, [nombre, clasificacion, presentacion, sustancia, cantidad, noPastillas, sede, fechaCaducidad]);
        return result;
    } catch (error) {
        throw error;
    }

}

const findAll = async () => {
    // Lógica para obtener todos los productos
    const sql = "CALL SHOW_PRODUCTS()";
    try {
        const [rows] = await pool.query(sql);
        return rows;
    } catch(error) {
        throw error;
    }
}

module.exports = { save
, findAll }