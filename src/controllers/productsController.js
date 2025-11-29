const controller = {};

controller.list = (req, res) => {
    req.getConnection((err, conn) => {
        conn.query('CALL SHOW_PRODUCTS()', (queryErr, products) => {
        if (err) {
            console.error('Connection error:', err);
            return res.status(500).json({ error: 'DB connection error' });
        }
        //console.log(products);
        res.render('inventario', { products : products[0], user : req.user });
        });
    });
};
// API - ATENCION MEDICA
controller.search = (req, res) => {
    const { q } = req.query; // usa un nombre claro para el parámetro
    console.log("QUERY:", q);
    if (!q || q.trim().length < 2) {
        return res.status(400).json({ error: 'La búsqueda debe tener al menos 2 caracteres.'  });
    }
    req.getConnection((err, conn) => {
        if (err) {
            console.error('Connection error:', err);
            return res.status(500).json({ error: 'DB connection error' });
        }
        const sql = 'CALL BuscarMedicamentos(?)';
        conn.query(sql, [q.trim()], (err, results) => {
            if (err) {
                console.error('Query error:', err);
                return res.status(500).json({ error: 'DB query error' });
            }
            // results[0] contiene las filas del procedimiento almacenado
            const medicamentos = results[0] || [];
            //console.log(medicamentos);
            res.json(medicamentos);
        });
    });
};

controller.getCart = (req, res) => {
    req.getConnection((err, conn) => {
        if (err) {
            console.error('Connection error:', err);
            return res.status(500).json({ error: 'No se encontraron medicamentos.' });
        }
        const sql= 'CALL GET_MediCart()';
        conn.query(sql, (err, results) => {
            if (err) {
                console.error('Query error:', err);
                return res.status(500).json({ error: 'No se encontraron medicamentos x2' });
            }
            const carrito = results[0] || [];
            //console.log(carrito);
            res.json(carrito);
        })
    })
};

controller.addProductCart = (req, res) => {
    const { id, quantity } = req.params;
    console.log(req.body);
    req.getConnection((err, conn) => {
        if (err) {
            console.error('Connection error:', err);
            return res.status(500).json({ error: 'DB connection error' });
        }
        const sql= "CALL ADD_MediCart(?, ?)";
        conn.query(sql, [id, quantity], (err, results) => {
            if (err) {
                console.error('Query error:', err);
                return res.status(500).json({ error: 'DB query error' });
            }
            console.log(results);
            if(results[0][0].code === "true"){
            res.json({ ok: true, message: 'Producto agregado al carrito' });
            }else{
            res.json({ ok: false, message: 'No se pudo agregar el producto al carrito' });
            };
        })
    })
}
//============ DELETE PRODUCTO DEL CARRITO ============
controller.deleteProductCart = (req, res) => {
    const { id } = req.params;
    req.getConnection((err, conn) => {
        if (err) {
            console.error('Connection error:', err);
            return res.status(500).json({ error: 'DB connection error' });
        }
        const sql= "CALL DEL_MediCart(?)";
        conn.query(sql, [id], (err, results) => {
            if (err) {
                console.error('Query error:', err);
                return res.status(500).json({ error: 'DB query error' });
            }
            console.log(results);
            if(results[0][0].code === "true"){
            res.json({ ok: true, message: 'Producto eliminado del carrito' });
            }else{
            res.json({ ok: false, message: 'No se pudo eliminar el producto del carrito' });
            }
        })
    })
};

//=== RESETEAR CARRITO ====
controller.resetProductsCart = (req, res) => {
    req.getConnection((err, conn) => {
        if (err) {
            console.error('Connection error:', err);
            return res.status(500).json({ error: 'DB connection error' });
        }
        const sql= "CALL Reset_Cart()";
        conn.query(sql, (err, results) => {
            if (err) {
                console.error('Query error:', err);
                return res.status(500).json({ error: 'DB query error' });
            }
            //console.log(results);
            if(results[0][0].code === "true"){
            res.json({ ok: true, message: 'Atencion cancelada' });
            }else{
            res.json({ ok: false, message: 'Ocurrió un error' });
            }
})})
};
//============ FINALIZAR ATENCION MEDICA ============

// POST /api/finalizar-atencion
controller.finalizarAtencion = async (req, res) => {
    const {NUA , nombre, apellidoP} = req.body;
    let {diagnostico, apellidoM} = req.body;
    const enfermeraID = req.user.E_Id;
    if (!NUA || !nombre || !apellidoP) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }
    if (!diagnostico){
        diagnostico = "vacio";
    }
    if (!apellidoM){
        apellidoM = " ";
    }
    try {
        //console.log(NUA," - ", nombre," - ", apellidoP," - ", apellidoM, " -DIAG-",diagnostico, " -ID- ",enfermeraID);
        req.getConnection((err, conn) => {
            if (err) {
                console.error('Connection error:', err);
                return res.status(500).json({ error: 'Error de conexión a la base de datos' });
            }
            const sql = 'CALL ADD_ATENTION(?, ?, ?, ?, ?, ?)';
            conn.query(sql, [enfermeraID,diagnostico, NUA, nombre, apellidoP, apellidoM], (err, results) => {
                if (err) {
                    console.error('Query error:', err);
                    return res.status(500).json({ error: 'Error al ejecutar la consulta' });
                }
                //console.log(results);
                if (results[0][0].code === "true") {
                    return res.status(200).json({ ok: true, message: 'Atención registrada con éxito' });
                } else {
                    return res.status(500).json({ error: 'No se pudo registrar la atención' });
                }
            });
        })

    }catch (err) {
        console.error('Error al finalizar atención:', err);
        res.status(500).json({ error: 'Error interno al registrar atención' });
    }
};


//===========================================
controller.create = (req, res) => {
    const data = [
        req.body.Clasificacion,
        req.body.Presentacion,
        req.body.Sustancia,
        Number(req.body.Cantidad),
        Number(req.body.noPastillas),
        Number(req.body.elementosres),
        req.body.Sede,
        req.body.fechaCaducidad

    ];

    req.getConnection((err, conn) => {
        if(err) {
            console.error('Connection error:', err);
            return res.status(500).json({ error: 'DB connection error' });
        }
        //console.log(data);
        conn.query('CALL INS_PRODUCT( ?, ?, ?, ?, ?, ?, ?, ? )', data, (err, result) => {
            if (err) {
                console.error('Query error:', err);
                return res.status(500).json({ error: 'DB query error' });
            }
            res.redirect('/inventario');
            //console.log(result);
        });

    })
}
controller.delete = (req, res) => {
    const { id } = req.params;
    req.getConnection((err, conn) => {
        if(err) {
            console.error('Connection error:', err);
            return res.status(500).json({ error: 'DB connection error' });
        }
        conn.query('CALL DEL_PRODUCT(?)', [id], (err, result) => {
            if (err) {
                console.error('Query error:', err);
                return res.status(500).json({ error: 'DB query error' });
            }
            res.redirect('/inventario');
        });
    })
};
controller.edit = (req, res) => {
    const { id } = req.params;
    req.getConnection((err, conn) => {
        if(err) {
            console.error('Connection error:', err);
            return res.status(500).json({ error: 'DB connection error' });
        }
        conn.query('CALL GET_PRODUCT(?)', id, (err, products) => {
            if (err) {
                console.error('Query error:', err);
                res.redirect('/inventario');
                return res.status(500).json({ error: 'DB query error' });
            }
            console.log("GET-> PRODUCTO ",products[0]);
            res.render('editar', {title: 'Editar medicamento' ,product : products[0][0] , user : req.user });
        });
    })
};

controller.update = (req, res) => {
    const { id } = req.params;
    const data = [
        req.body.ID,
        req.body.Clasificacion,
        req.body.Presentacion,
        req.body.Sustancia,
        Number(req.body.Cantidad),
        Number(req.body.noPastillas),
        Number(req.body.elementosres),
        req.body.Sede,
        req.body.fechaCaducidad
    ];
    req.getConnection((err, conn) => {
        if(err) {
            console.error('Connection error:', err);
            return res.status(500).json({ error: 'DB connection error' });
        }
        conn.query('CALL EDIT_PRODUCT( ?, ?, ?, ?, ?, ?, ?, ?, ? )', data, (err, result) => {
            if (err) {
                console.error('Query error:', err);
                return res.status(500).json({ error: 'DB query error' });
            }
            res.redirect('/inventario');
        });
    })
};

export default controller;