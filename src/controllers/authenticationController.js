import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

//const pass1 = "Test-Password123"
//const hashedPassword = await bcrypt.hash(pass1, 5);
//console.log(hashedPassword);

async function login(req, res) {
    const user = req.body.username;
    const password = req.body.password;

    if (!user || !password) {
        return res.status(400).json({ error: 'Se requiere que los campos sean llenados.' });
    }

    req.getConnection((err, conn) => {
        if (err) {
            console.error('Connection error:', err);
            return res.status(500).json({ error: 'DB connection error' });
        }

        const sql = 'CALL GET_USER_BY_USERNAME(?)';
        console.log("Usuario recibido:", user);

        conn.query(sql, [user], async (err, result) => {   // <-- aquí la corrección
            if (err) {
                console.error('Query error:', err);
                return res.status(500).json({ error: 'DB query error [TIMEOUT]' });
            }

            const userData = result?.[0]?.[0];
            if (!userData) return res.status(400).json({ error: 'Credenciales inválidas.' });

            const passwordMatch = await bcrypt.compare(password, userData.U_Password);
            if (!passwordMatch) return res.status(400).json({ error: 'Credenciales inválidas.' });

            const userPayload = {
                id: userData.U_ID,
                username: userData.U_User,
                E_Id: userData.U_EID,
                imgPath: userData.U_ImgPath,
                firstName: userData.Nombre,
                lastNameP: userData.Apellido_pat,
                lastNameM: userData.Apellido_mat,
                phone: userData.Telefono
            };

            const token = jsonwebtoken.sign(
                { user: userPayload },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRATION || '1d' }
            );

            const cookieConfig = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: Number(process.env.JWT_COOKIE_EXPIRES_DAYS || 7) * 24 * 60 * 60 * 1000
            };

            res.cookie('jwt', token, cookieConfig);
            return res.status(200).json({ message: 'Login correcto', redirect: '/home' });
        });
    });
}


function logout(req, res) {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: 'Error al cerrar sesión' });
        res.clearCookie('jwt'); // borra cookie en servidor
        res.json({ ok: true, redirect: '/login' });
    });
};

async function register (req, res) {
    console.log(req.body);
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
        return res.status(400).json({ error: 'Se requiere que los campos sean llenados.' });
    }
    // AQUI IRIA COMPROBACION SI EL USUARIO YA EXISTE
    const salt= bcrypt.genSalt(5);
    const hashedPassword = await bcrypt.hash(password, salt);
    // AQUI IRIA EL CODIGO PARA GUARDAR EL USUARIO EN LA BASE DE DATOS
    try {
        res.status(201).json({ message: 'Usuario registrado exitosamente.' });
        req.getConnection()((err, conn) => {
            if(err) {
                console.error('Connection error:', err);
                return res.status(500).json({ error: 'DB connection error' });
            }
            const data = [username, hashedPassword, email];
            conn.query('CALL INS_USER( ?, ?, ? )', data, (err, result) => {
                if (err) {
                    console.error('Query error:', err);
                    return res.status(500).json({ error: 'DB query error' });
                }
                res.status(201).json({ message: 'Usuario registrado exitosamente.' });
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar el usuario.' });
    }
}

export const methods = {
    login,
    register,
    logout
};