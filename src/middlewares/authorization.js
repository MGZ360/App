import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

function adminOnly(req, res, next) {
    let verifyprev;
    try{verifyprev = jsonwebtoken.verify(req.headers.cookie.split('; ').find(cookie => cookie.startsWith('jwt=')).slice(4), process.env.JWT_SECRET)
    }catch(e){
        verifyprev = null;
    }
    if (!verifyprev) {
        return res.redirect('/login');
    }
    const isUser = getUserFromToken(req);
    if (isUser) {
        next();
    } else {
        return res.status(403).json({ error: 'Acceso denegado.' });
    }
}

function loggedOnly(req, res, next) {
    let verifyprev;
    try{verifyprev = jsonwebtoken.verify(req.headers.cookie.split('; ').find(cookie => cookie.startsWith('jwt=')).slice(4), process.env.JWT_SECRET)
    }catch(e){
        verifyprev = null;
    }
    if (!verifyprev) {
        return res.redirect('/login');
    }
    const isUser = getUserFromToken(req);
    if (isUser) { next() } else {
        return res.redirect('/login');
    }
}

function getUserByUsername(req, username) {
    return new Promise((resolve, reject) => {
        req.getConnection((err, conn) => {
            if (err) {
                console.error('Connection error:', err);
                return reject(err);
            }
            const sql = 'CALL GET_USER_BY_USERNAME(?)';
            conn.query(sql, [username], (err, result) => {
                if (err) {
                    console.error('Query error:', err);
                    return reject(err);
                }
                const userDataOne = result[0][0]; // aquí está tu objeto
                resolve(userDataOne);
            });
        });
    });
}

async function getUserFromToken(req) {
    try {
        const cookieOne = req.headers.cookie.split('; ').find(cookie => cookie.startsWith('jwt=')).slice(4);
        //console.log("Cookie: ", cookieOne);
        const decoded = jsonwebtoken.verify(cookieOne, process.env.JWT_SECRET);

        //console.log("Decoded: ", decoded);
        // Espera directamente la promesa
        const userData = await getUserByUsername(req, decoded.username);
        //console.log("Objeto completo:", userData);
        //console.log("Solo el atributo User:", userData.U_User);
        // Devuelve true si existe, false si no
        if(!userData){
            return false
        }else{
            console.log(userData.U_User, " Successful authentication");
            return true}
    } catch (err) {
        console.error("Error:", err);
        return false;
    }
}

function verificarSesion(req, res, next) {
    const token = req.cookies?.jwt;
    if (!token) return res.status(401).json({ error: 'No autenticado' });
    try {
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;           // disponible en controllers
        res.locals.user = decoded.user;    // opcional para vistas
        //console.log(req.user);
        next();
    } catch (e) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
};
function isLogged(req, res, next) {
    const token = req.cookies?.jwt;
    if (token) {
        try {
            const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
            // Si el token es válido, redirige a home
            return res.redirect('/home');
        } catch (e) {
            // Token inválido → sigue al siguiente middleware (ej. login)
            return next();
        }
    }
    // No hay token → sigue al siguiente middleware (ej. login)
    next();
}



export const methods = {
    loggedOnly,
    adminOnly,
    verificarSesion,
    isLogged
}